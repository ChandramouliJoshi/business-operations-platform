
import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const testEnvPath = '.env.test.local';
const devEnvPath = '.env';

if (!existsSync(testEnvPath) || !existsSync(devEnvPath)) {
  throw new Error('Required environment files are missing.');
}

const testEnv = dotenv.parse(readFileSync(testEnvPath));
const devEnv = dotenv.parse(readFileSync(devEnvPath));

const runtimeDatabaseUrl = process.env.NEXORA_E2E_DATABASE_URL ?? testEnv.DATABASE_URL;

if (!runtimeDatabaseUrl || !devEnv.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing.');
}

if (testEnv.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV must be set to test.');
}

const testUrl = new URL(runtimeDatabaseUrl);
const devUrl = new URL(devEnv.DATABASE_URL);

function getSupabaseProjectRef(url) {
  const directMatch = url.hostname.match(
    /^db\.([^.]+)\.supabase\.co$/,
  );

  if (directMatch) return directMatch[1];

  const poolerMatch = url.username.match(
    /^postgres\.([^.]+)$/,
  );

  if (poolerMatch) return poolerMatch[1];

  return null;
}

if (!['postgres:', 'postgresql:'].includes(testUrl.protocol)) {
  throw new Error('Test database must use PostgreSQL.');
}

const testProjectRef = getSupabaseProjectRef(testUrl);
const devProjectRef = getSupabaseProjectRef(devUrl);
const sameDatabase =
  testUrl.hostname === devUrl.hostname &&
  testUrl.port === devUrl.port &&
  testUrl.pathname === devUrl.pathname;

if (sameDatabase || (testProjectRef && devProjectRef && testProjectRef === devProjectRef)) {
  throw new Error('SAFETY BLOCK: Test and development projects match.');
}

if (testUrl.hostname === 'localhost' || testUrl.hostname === '127.0.0.1' || testUrl.hostname === '::1') {
  if (testUrl.pathname === '/postgres') {
    throw new Error('Unexpected local test database name. Use a dedicated database such as nexora_test.');
  }
} else if (testProjectRef && testUrl.pathname !== '/postgres') {
  throw new Error('Unexpected Supabase test database name.');
}

console.log('Database isolation verified.');
console.log('Test target:', `${testUrl.hostname}${testUrl.pathname}`);
console.log('Development target:', `${devUrl.hostname}${devUrl.pathname}`);
console.log('Deploying Prisma schema to test database...');

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['prisma', 'db', 'push', '--schema', 'prisma/schema.prisma'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      ...testEnv,
      DATABASE_URL: runtimeDatabaseUrl,
      NODE_ENV: 'test',
    },
  },
);

if (result.error) throw result.error;

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('Test database schema deployment completed.');
