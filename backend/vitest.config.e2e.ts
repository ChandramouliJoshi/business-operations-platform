
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'node:fs';

const testEnvPath = '.env.test.local';

if (!existsSync(testEnvPath)) {
  throw new Error(`Missing ${testEnvPath}.`);
}

// Load test environment before importing application modules.
const testEnv = dotenv.parse(readFileSync(testEnvPath));
// CI/local runs may inject a disposable database without modifying the
// developer's ignored .env.test.local file.
const runtimeDatabaseUrl = process.env.NEXORA_E2E_DATABASE_URL ?? testEnv.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error('DATABASE_URL is missing from .env.test.local.');
}

if (testEnv.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV must be set to test.');
}

const testUrl = new URL(runtimeDatabaseUrl);

if (!['postgres:', 'postgresql:'].includes(testUrl.protocol)) {
  throw new Error('Test database must use PostgreSQL.');
}

// Verify the test database is not the development database.
if (existsSync('.env')) {
  const devEnv = dotenv.parse(readFileSync('.env'));

  if (devEnv.DATABASE_URL) {
    const devUrl = new URL(devEnv.DATABASE_URL);

    if (
      devUrl.hostname === testUrl.hostname &&
      devUrl.pathname === testUrl.pathname
    ) {
      throw new Error(
        'SAFETY BLOCK: Test database matches development database.',
      );
    }
  }
}

// Make test credentials available to Prisma and NestJS.
dotenv.config({
  path: testEnvPath,
  override: true,
});
if (process.env.NEXORA_E2E_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NEXORA_E2E_DATABASE_URL;
}

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup/e2e.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
