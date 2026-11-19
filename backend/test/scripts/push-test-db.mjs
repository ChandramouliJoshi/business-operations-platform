
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

if (!testEnv.DATABASE_URL || !devEnv.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing.');
}

if (testEnv.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV must be set to test.');
}

const testUrl = new URL(testEnv.DATABASE_URL);
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

if (!testProjectRef || !devProjectRef) {
  throw new Error('Could not verify Supabase project references.');
}

if (testProjectRef === devProjectRef) {
  throw new Error('SAFETY BLOCK: Test and development projects match.');
}

if (testUrl.pathname !== '/postgres') {
  throw new Error('Unexpected test database name.');
}

console.log('Database isolation verified.');
console.log('Test project:', testProjectRef);
console.log('Development project:', devProjectRef);
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
      DATABASE_URL: testEnv.DATABASE_URL,
      NODE_ENV: 'test',
    },
  },
);

if (result.error) throw result.error;

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('Test database schema deployment completed.');
