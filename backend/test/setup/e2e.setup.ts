
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Validate test database configuration
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Test DATABASE_URL is not configured. Set NEXORA_E2E_DATABASE_URL or configure backend/.env.test.local.');
}

let parsedUrl: URL;

try {
  parsedUrl = new URL(databaseUrl);
} catch {
  throw new Error('Test DATABASE_URL is not a valid URL.');
}

if (
  parsedUrl.protocol !== 'postgres:' &&
  parsedUrl.protocol !== 'postgresql:'
) {
  throw new Error('Test DATABASE_URL must be a PostgreSQL connection URL.');
}

console.info(`E2E database target: ${parsedUrl.hostname}${parsedUrl.pathname}`);

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Integration tests must run with NODE_ENV=test.');
}

if (
  parsedUrl.hostname.includes('YOUR_PROJECT_REF') ||
  parsedUrl.password.includes('YOUR_PASSWORD')
) {
  throw new Error('Test DATABASE_URL still contains placeholder values.');
}

// Automatically discover permissions from backend decorators
function findPermissionNames(directory: string): Set<string> {
  const permissions = new Set<string>();

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'generated') {
        for (const permission of findPermissionNames(fullPath)) {
          permissions.add(permission);
        }
      }

      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts')) {
      continue;
    }

    const content = readFileSync(fullPath, 'utf-8');

    const matches = content.matchAll(
      /@RequirePermission\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    );

    for (const match of matches) {
      permissions.add(match[1]);
    }
  }

  return permissions;
}

// Seed missing permissions into the dedicated test database
async function seedPermissions() {
  const permissionNames = findPermissionNames(join(process.cwd(), 'src'));

  if (permissionNames.size === 0) {
    throw new Error(
      'No @RequirePermission() decorators were found. Permission seeding aborted.',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await prisma.$connect();

    await prisma.permissions.createMany({
      data: Array.from(permissionNames).map((name) => ({ name })),
      skipDuplicates: true,
    });

    console.info(
      `E2E permissions ready: ${permissionNames.size} permission(s).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

console.info('E2E test environment initialized.');

await seedPermissions();
