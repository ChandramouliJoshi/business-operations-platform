# Nexora project audit

Audit date: 2026-11-26

## Baseline

Nexora is a two-package TypeScript application. The backend is NestJS 12 with Prisma 7 and PostgreSQL; the frontend is React 19, Vite 8, Tailwind 4 and React Router 7. Both packages have lockfiles and are already installed in the repository. The working tree was clean at the start of this audit.

## Implemented foundations

- JWT login, registration and `/auth/me`; passwords are bcrypt-hashed.
- Prisma schema includes users, organizations, organization members, roles, permissions, departments, projects, tasks, workflows, requests, approvals, notifications and audit logs.
- NestJS modules/controllers/services exist for the listed domain areas.
- Organization routes, member/role/department routes, project/task routes and workflow/request/approval/notification/audit-log routes are present.
- A permission decorator/guard performs organization membership and role-permission checks for routes that opt into it.
- Frontend landing, login, registration, organization selection, appearance switching and protected routing exist.
- Backend unit/controller tests and several e2e suites are present.

## Material gaps and risks

1. The workspace shell is now implemented in `frontend/src/Dashboard.tsx`; the former self-referential dashboard defect is resolved.
2. The legacy `ProjectsPage` demo surface has now been replaced with an API-backed project/task workspace, including task editing. Broader activity/timeline views remain outside this increment.
3. Frontend now exposes project/task, Team & Access, Operations, Notifications, and Activity Log views. The workspace overview consumes a real analytics aggregation endpoint.
4. `AuthContext` validates sessions through `/auth/me` and Axios clears expired sessions centrally; the current profile model remains limited to JWT claims (`userId`/email).
5. Backend authorization is opt-in per controller and the permission guard reads `organizationId` from route params. Project/task/member/department/request/workflow/approval/analytics mutations include organization predicates; transition actors use the existing `requests.transition` permission plus optional transition role restrictions.
6. A reviewed additive migration is now prepared under `backend/prisma/migrations`, but the repository still lacks a verified historical baseline for an existing database. It must not be deployed until staging/baseline review is complete.
7. Domain notification/audit wiring now covers request/approval/workflow activity and analytics; a full integration run remains blocked by unavailable PostgreSQL infrastructure.
8. Environment, deployment, migration and health-check guidance is now documented, but production secret management and hosting configuration remain deployment-owner responsibilities.

## Verification baseline

After this increment, both production builds pass and the backend unit suite passes 43/43 tests across 33 files, including workflow, request, approval, notification, audit, analytics, task-update and organization-tenancy behavior tests. The e2e suite discovers five suites but cannot start because the configured Supabase test database is unreachable at `aws-1-ap-southeast-2.pooler.supabase.com`; no e2e tests execute until an isolated PostgreSQL database is available. No database reset, migration, or destructive setup was performed.

## Priority

The next safe increment is to establish a staging/test PostgreSQL target, baseline the existing database migration history, and run the complete integration journeys. Production readiness remains conditional until those external checks pass.

## Production-readiness classification

### Verified and complete

- Frontend and backend production builds pass.
- Backend unit suite passes 43/43 tests across 33 files.
- Organization-scoped project, task, team, workflow, request, approval, notification, audit and analytics code paths have source-level tests for key isolation rules.
- `/health` endpoint exists and checks database connectivity.
- Additive workflow migration SQL has been prepared and reviewed for non-destructive operations.

### Implemented but not integration-tested

- Complete browser journeys across registration, organization setup, project/task operations, workflow/request/approval lifecycle, notifications, audit logs and analytics.
- Workflow activation and transition-role behavior against a migrated database.

### Requires external infrastructure

- E2E execution requires an isolated PostgreSQL database; the configured Supabase test host is unreachable.
- Staging validation of the prepared migration requires a database owner and backup/snapshot.

### Remaining risks

- No verified historical Prisma migration baseline is present in the repository.
- Browser-level accessibility/responsive QA and production hosting smoke tests remain manual.
- JWTs remain in sessionStorage by the established architecture; deployment should enforce HTTPS and a strict CSP while a future auth-hardening decision is evaluated.

## Final integration verification

- E2E execution was attempted on 2026-11-26 using the configured `NEXORA_E2E_DATABASE_URL` source. All five suites failed during setup while seeding permissions because `aws-1-ap-southeast-2.pooler.supabase.com` was unreachable; 0 tests executed. The Supabase database was not reset or modified.
- Docker CLI is installed, but the Docker Desktop Linux engine is not running, and no local PostgreSQL listener is available on port 5432. A disposable PostgreSQL target must therefore be supplied externally before E2E execution can proceed.
- Browser QA was not claimed as passed. The local Vite server was started successfully, but the available browser automation surface could not connect to the local loopback URL. Registration through logout, responsive/theme checks and console/network inspection remain pending in a browser that can reach the deployment or forwarded local URL.
- Migration review confirms the prepared SQL is additive: existing workflow rows receive `is_active = true`, existing transitions remain unrestricted because `allowed_role_id` is nullable, and the foreign key references `roles(id)` without delete cascades. No historical Prisma baseline was found, so staging baseline verification remains a deployment prerequisite.
