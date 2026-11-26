# Nexora architecture

## Runtime boundaries

The React/Vite frontend owns navigation, presentation, form state and sessionStorage token attachment. The NestJS backend owns authentication, validation, authorization, business rules and persistence. PostgreSQL is accessed only through Prisma services.

## Request flow

1. The frontend Axios client attaches the short-lived JWT from `sessionStorage`.
2. `JwtAuthGuard` validates the token and places the authenticated user on the request.
3. Organization-scoped controllers use `PermissionsGuard` plus a resource service check.
4. Services query Prisma using both the requested resource identifier and organization membership/ownership predicates.
5. Mutations should record an organization audit event and create user notifications when the domain event is actionable.

## Tenancy model

Organizations are the tenant boundary. `organization_members` links users to organizations and roles. Projects belong directly to an organization; tasks inherit tenancy through their project. Requests, workflows, departments, roles and audit logs carry an organization id directly. No frontend organization id is trusted without backend membership validation.

## Frontend composition

`App.tsx` owns public/protected routes. `Dashboard.tsx` is the organization workspace shell. Feature pages should remain route-level components and use the shared `lib/api.ts` client. Shared loading, empty, error and authorization states belong in reusable components as the surface expands.

## Persistence principles

- Keep UUID foreign keys and existing table names intact.
- Prefer additive schema changes and explicit migrations.
- Use compound organization predicates in service queries.
- Add indexes only for measured/high-frequency filters.
- Never reset or destructively migrate a user database without explicit approval.

## Cross-cutting concerns

Authentication and tenant authorization are backend concerns; frontend permission checks are only a usability layer. Audit and notification creation should be centralized behind services so domain modules do not duplicate formatting or sensitive-data filtering.

## Team and access management

Members, roles and departments are exposed beneath the organization route. Member role/department mutations validate both the member and target role/department against the same organization. Owner demotion/removal is rejected when it would leave the organization without an active Owner. The Team & Access frontend is an API client only; it does not treat hidden controls as authorization.

## E2E database safety

E2E tests require a dedicated PostgreSQL target configured in `backend/.env.test.local` or via `NEXORA_E2E_DATABASE_URL`. The test configuration rejects non-PostgreSQL URLs and refuses a database that matches the development URL. Test cleanup is scoped to generated user/organization/resource identifiers. The existing Supabase database must never be reset or used as a substitute for an isolated test database.

## Workflow and request lifecycle

Workflows own ordered states and explicit directed transitions. Requests reference one workflow and one current state; creation requires exactly one initial state. Request edits are limited to the requester while the current state is non-final. Approval decisions require the assigned reviewer, reject duplicate decisions, and move the request through a configured transition to an approved/rejected (or explicitly supplied) state in the same transaction. Request history is read from organization-scoped audit records.

The current schema supports workflow-level RBAC through `workflows.*`, `workflow_states.*`, `workflow_transitions.*`, `requests.*` and `approvals.*` permissions. Transition role restrictions are optional and additive; the existing `requests.transition` permission remains the coarse-grained fallback.

The workflow schema now includes additive `workflows.is_active` and nullable `workflow_transitions.allowed_role_id` fields. The application rejects new requests for inactive workflows, prevents deactivation while non-final requests depend on a workflow, and validates an allowed transition role against the requester's active organization membership. These changes require an additive Prisma migration before deployment; no migration was executed in this increment.

## Analytics, notifications and audit interfaces

`GET /organizations/:organizationId/analytics` performs organization-scoped aggregate counts and grouped task distributions, workload, pending request/approval counts, recent activity and the current user's recent notifications without N+1 task queries. `GET /notifications` returns paginated user-owned notifications with unread totals; read mutations remain user-owned. `GET /organizations/:organizationId/audit-logs` returns paginated, searchable, organization-scoped activity and requires `audit_logs.view`. Frontend screens intentionally show safe actor/resource metadata and do not expose authentication secrets.

## Deployment verification boundary

The backend exposes `GET /health`, which checks both process availability and a database `SELECT 1`; a degraded response indicates database unavailability. Production deployment requires `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL`, with `PORT` optional. The frontend requires only `VITE_API_URL` at build time and must not receive server secrets. CORS must be limited to the deployed frontend origin, HTTPS must be enforced, and the prepared migration must be baselined and tested in staging before production application.

E2E infrastructure is intentionally separate from development and production. Set `NEXORA_E2E_DATABASE_URL` to a disposable PostgreSQL database, apply the reviewed schema through the approved staging/test procedure, then run `npm run test:e2e` from `backend`. The current workstation has Docker installed without a running engine and no local PostgreSQL listener, so E2E remains externally blocked.
