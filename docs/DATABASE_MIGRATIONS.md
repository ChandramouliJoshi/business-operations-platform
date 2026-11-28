# Nexora database migration preparation

## Prepared migration

`backend/prisma/migrations/20261126230000_add_workflow_controls/migration.sql` is a reviewed additive migration for the current Prisma schema.

It performs only these changes:

- Adds `workflows.is_active BOOLEAN NOT NULL DEFAULT true`.
- Adds nullable `workflow_transitions.allowed_role_id UUID`.
- Adds an index on `workflow_transitions.allowed_role_id`.
- Adds a non-destructive foreign key from `workflow_transitions.allowed_role_id` to `roles.id`.

Existing workflow rows become active through the column default. Existing transitions remain unrestricted because `allowed_role_id` is nullable. No existing rows are deleted or rewritten.

## Before applying

The repository did not contain a prior Prisma migration history when audited. Do not run `prisma migrate deploy` against an existing Supabase database until the deployment owner establishes and verifies the database's migration baseline. First:

1. Take and verify a database backup/snapshot.
2. Compare the target schema with `backend/prisma/schema.prisma` and the prepared SQL.
3. Confirm the migration table/baseline strategy for the existing database.
4. Apply the SQL in a disposable or staging database first.
5. Verify existing workflows, transitions, requests and role relationships.
6. Apply during a reviewed maintenance window, then run smoke tests.

The prepared production migration was not executed, and no database reset or production database write was performed. `prisma db push` was executed only against the isolated local E2E database documented below.

## E2E database

Use a separate disposable PostgreSQL database for integration tests:

```powershell
$env:NEXORA_E2E_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/nexora_test'
cd backend
npm run test:e2e
```

The E2E configuration rejects non-PostgreSQL URLs and refuses a target matching the development database. Cleanup is scoped to records created by each suite.

### Final verification result

PostgreSQL 18.6 was running locally at `localhost:5432/nexora_e2e_test`. The database isolation check passed, `npm run db:push:test` completed successfully against that dedicated database, and all five E2E suites passed with 28/28 tests. Backend unit tests passed 43/43 across 33 files; backend and frontend production builds and Prisma schema validation also passed.

### Disposable PostgreSQL options

The preferred local setup is a disposable PostgreSQL container, for example:

```powershell
docker run --name nexora-e2e-postgres --rm -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nexora_test -p 5432:5432 -d postgres:16
$env:NEXORA_E2E_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/nexora_test'
cd backend
npm run db:push:test
npm run test:e2e
docker stop nexora-e2e-postgres
```

This procedure must only be used when Docker is connected to its local engine. The final verification used the separately provisioned local PostgreSQL 18.6 database at `localhost:5432/nexora_e2e_test`; all five E2E suites passed with 28/28 tests. A CI service container or separately provisioned disposable PostgreSQL instance can be substituted; its connection string must be supplied through `NEXORA_E2E_DATABASE_URL` or the ignored test environment file and must not match either development or production configuration.
