# Nexora project audit

Audit date: 2026-11-28

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
7. Domain notification/audit wiring now covers request/approval/workflow activity and analytics; the final isolated PostgreSQL integration run passed.
8. Environment, deployment, migration and health-check guidance is now documented, but production secret management and hosting configuration remain deployment-owner responsibilities.

## Verification baseline

The final verification run passed against the isolated local PostgreSQL 18.6 database `localhost:5432/nexora_e2e_test`:

- Backend unit tests: 43/43 passed across 33 files.
- E2E tests: 28/28 passed across all five suites.
- Backend production build: passed.
- Frontend production build: passed.
- Prisma schema validation: passed.
- Git diff check: passed.

The E2E database was isolated from Supabase, development and production databases. No database reset or production migration was performed.

## Priority

The next safe increment is to establish and verify the historical production migration baseline, validate the prepared migration in staging, and complete browser/hosting QA. Production readiness remains conditional until those checks pass.

## Production-readiness classification

### Verified and complete

- Frontend and backend production builds pass.
- Backend unit suite passes 43/43 tests across 33 files.
- Organization-scoped project, task, team, workflow, request, approval, notification, audit and analytics code paths have source-level tests for key isolation rules.
- `/health` endpoint exists and checks database connectivity.
- Additive workflow migration SQL has been prepared and reviewed for non-destructive operations.

### Implemented and integration-tested

- Backend E2E coverage passed for application connectivity, authentication, organization setup, members, projects and tasks.
- Workflow activation and transition-role behavior is covered by the backend unit/behavior suite; the prepared production migration remains separately gated by staging baseline review.

### Not covered by this verification run

- Browser QA, responsive/accessibility validation and production hosting smoke tests were not executed.

### Requires external infrastructure

- Staging validation of the prepared migration requires a database owner and backup/snapshot.
- Production hosting and browser validation require a deployed environment reachable by the QA browser.

### Remaining risks

- No verified historical Prisma migration baseline is present in the repository.
- Browser-level accessibility/responsive QA and production hosting smoke tests remain manual.
- JWTs remain in sessionStorage by the established architecture; deployment should enforce HTTPS and a strict CSP while a future auth-hardening decision is evaluated.

## Verification warnings recorded

- Frontend production output includes a main JavaScript bundle of approximately 998 KB, above the 500 KB bundler warning threshold.
- PostgreSQL emitted a `client.query()` concurrency deprecation warning during the verification run.
- Node emitted a child-process `shell: true` deprecation warning.
- Git emitted expected LF/CRLF working-tree line-ending warnings.

## Final integration verification

- The final E2E run completed against isolated local PostgreSQL 18.6 at `localhost:5432/nexora_e2e_test`; all five suites passed with 28/28 tests.
- The earlier Supabase-host failure and unavailable-local-listener attempts were infrastructure-only preflight attempts and did not modify those databases.
- Browser QA was not claimed as passed. Registration through logout, responsive/theme checks and console/network inspection remain pending in a browser that can reach the deployment or forwarded local URL.
- Migration review confirms the prepared SQL is additive: existing workflow rows receive `is_active = true`, existing transitions remain unrestricted because `allowed_role_id` is nullable, and the foreign key references `roles(id)` without delete cascades. No historical Prisma baseline was found, so staging baseline verification remains a deployment prerequisite.
