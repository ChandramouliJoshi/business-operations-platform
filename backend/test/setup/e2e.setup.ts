
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Test DATABASE_URL is not configured.');
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

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Integration tests must run with NODE_ENV=test.');
}

if (
  parsedUrl.hostname.includes('YOUR_PROJECT_REF') ||
  parsedUrl.password.includes('YOUR_PASSWORD')
) {
  throw new Error('Test DATABASE_URL still contains placeholder values.');
}

console.info('E2E test environment initialized.');
