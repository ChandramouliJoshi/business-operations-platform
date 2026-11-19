
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

if (!testEnv.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from .env.test.local.');
}

if (testEnv.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV must be set to test.');
}

const testUrl = new URL(testEnv.DATABASE_URL);

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
