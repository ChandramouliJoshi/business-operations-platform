# Nexora implementation roadmap

Updated: 2026-11-26

Status uses `done`, `in progress`, `blocked`, or `not started`. A task is marked done only after source inspection and relevant verification.

## Phase 0 — audit and baseline

- [x] Inventory frontend/backend structure, packages, Prisma schema and tests.
- [x] Document current implementation and risks in `PROJECT_AUDIT.md`.
- [x] Document runtime and tenancy architecture in `ARCHITECTURE.md`.
- [ ] Establish a reproducible database migration workflow.

## Phase 1 — authentication, organizations and infrastructure (in progress)

- [x] Identify and correct the broken workspace route entry point.
- [x] Add centralized session-expiration/401 handling.
- [x] Add DTO validation and normalized email handling for auth endpoints.
- [ ] Verify every organization/member/department service query for tenant isolation.
- [ ] Add a typed current-user/profile contract and organization context.

## Phase 2 — projects and tasks (in progress)

- [x] Replace the workspace project summary with API-backed queries.
- [x] Replace the legacy mock project page with API-backed queries and mutations.
- [x] Add project detail, update and delete endpoints with organization scoping.
- [x] Add typed DTO validation for project and task create/update endpoints.
- [x] Add project search/status filtering and task assignment/status/priority/due-date controls.
- [x] Add project/task loading, error, empty and confirmation states.
- [ ] Add task edit UI and server-side pagination/search contracts.
- [ ] Add task list/create/edit/filter experience backed by the existing task APIs.
- [ ] Add server-side pagination/search/filter contracts.
- [ ] Calculate project progress from persisted tasks.

## Phase 3 — team, departments and RBAC (not started)

- [x] Complete member directory with search, role changes, department assignment and removal.
- [x] Add department create/edit/delete UI and organization-scoped backend APIs.
- [x] Add member detail/update/remove and department detail/update/delete endpoints.
- [x] Protect the last active Owner from removal or demotion.
- [x] Add role-aware Team & Access workspace navigation.
- [ ] Add invitation lifecycle with an external email provider; no provider is configured, so invitations are intentionally not simulated.
- [ ] Add complete permission matrix administration UI.
- [ ] Add invitation lifecycle if an email provider is configured.

## Phase 4 — workflows and requests (in progress)

- [x] Expose workflow listing, detail, state creation and transition configuration UI.
- [x] Add request submission, listing, detail/history and category metadata UI.
- [x] Restrict request editing/cancellation to permitted requester states.
- [x] Enforce organization-scoped workflow transitions and invalid-transition rejection.
- [x] Add additive workflow activation state and optional per-transition role restriction fields to Prisma schema; migration intentionally not executed.
- [x] Prevent deactivation when in-progress requests still depend on the workflow.
- [x] Enforce optional transition-role restrictions server-side.

## Phase 5 — approvals, notifications and audit (in progress)

- [x] Wire request submission/status changes and approval assignment/decisions to database notifications.
- [x] Add approval inbox with approve/reject actions tied to valid workflow transitions.
- [x] Expose request audit history in request details.
- [x] Add notification center with unread counts, filtering, read/read-all actions and paginated API loading.
- [x] Add organization audit-log screen with search, actor/resource display and paginated API loading.
- [ ] Review all event metadata for redaction and add sequential/multi-step approval policy support.

## Phase 6 — dashboard and analytics (in progress)

- [x] Add organization dashboard aggregation endpoint with project/task/request/approval counts, distributions, workload and recent activity.
- [x] Replace workspace project/role-only metrics with live project/task/request/approval analytics.
- [x] Add loading/error fallback when analytics permission/data is unavailable.
- [ ] Add richer chart visualizations and explicit date-range controls.

## Phase 7 — design, responsive UX and accessibility (not started)

- [ ] Standardize workspace shell, dialogs, forms, tables and responsive behavior.
- [ ] Verify light/dark contrast and keyboard navigation.

## Phase 8 — security, tests and deployment (not started)

- [ ] Add isolation and permission regression coverage for every resource.
- [x] Repair Nest unit-test dependency setup; 43/43 unit tests pass across 33 files.
- [x] Add task-update, workflow/request/approval, notification/audit/analytics, and cross-organization/team-management behavior tests.
- [x] Run frontend/backend production builds; both pass.
- [x] Harden E2E configuration with `NEXORA_E2E_DATABASE_URL` override and a safe example configuration.
- [ ] Run e2e tests against an available isolated PostgreSQL test environment; currently blocked by unreachable configured Supabase host.
- [ ] Document environment variables, migrations, deployment and API usage.

## Phase 9 — production readiness (in progress)

- [x] Audit current implementation against the roadmap and update stale gaps.
- [x] Prepare additive workflow-controls migration SQL without executing it.
- [x] Add database-aware `/health` endpoint.
- [x] Add backend/frontend production environment and build instructions.
- [ ] Establish and verify a historical Prisma migration baseline.
- [ ] Run the prepared migration in an isolated staging database and inspect results.
- [ ] Execute all E2E and end-to-end business journeys against isolated PostgreSQL.
- [ ] Complete browser-level responsive, accessibility, and production hosting QA.

Verification note: E2E was attempted on 2026-11-26, but all five suites stopped during setup because the configured Supabase host was unreachable; no tests ran. Docker Desktop was unavailable and no local PostgreSQL listener was present, so no substitute database was created or used.

## Next recommended increment

Provide a disposable PostgreSQL test target and run the E2E suites. Then add complete permission-matrix administration and invitation lifecycle once an email provider is configured.
