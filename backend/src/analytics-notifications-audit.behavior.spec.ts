import { describe, expect, it, vi } from 'vitest';
import { NotificationsService } from './notifications/notifications.service.js';
import { AuditLogsService } from './audit-logs/audit-logs.service.js';
import { AnalyticsService } from './analytics/analytics.service.js';
import { WorkflowsService } from './workflows/workflows.service.js';
import { WorkflowTransitionsService } from './workflow-transitions/workflow-transitions.service.js';

describe('analytics, notification, audit and workflow safeguards', () => {
  it('does not allow one user to mark another user notification as read', async () => {
    const service = new NotificationsService({ notifications: { findUnique: vi.fn().mockResolvedValue({ id: 'notification-1', user_id: 'owner-1' }) } } as any);
    await expect(service.markAsRead('other-user', 'notification-1')).rejects.toThrow('cannot access this notification');
  });

  it('scopes audit queries to the organization', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const service = new AuditLogsService({ audit_logs: { findMany, count } } as any);
    await service.getOrganizationLogs('org-1', { search: 'task' });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ organization_id: 'org-1' }) }));
  });

  it('rejects analytics for a missing organization', async () => {
    const service = new AnalyticsService({ organizations: { findUnique: vi.fn().mockResolvedValue(null) } } as any);
    await expect(service.getDashboard('org-missing', 'user-1')).rejects.toThrow('Organization not found');
  });

  it('prevents deactivating a workflow used by an in-progress request', async () => {
    const prisma = { workflows: { findFirst: vi.fn().mockResolvedValue({ id: 'workflow-1', name: 'Leave', is_active: true }) }, requests: { findFirst: vi.fn().mockResolvedValue({ id: 'request-1' }) } };
    const service = new WorkflowsService(prisma as any);
    await expect(service.updateWorkflow('org-1', 'workflow-1', 'user-1', undefined, undefined, undefined, false)).rejects.toThrow('in-progress request');
  });

  it('rejects a transition role from another organization', async () => {
    const prisma = { workflows: { findFirst: vi.fn().mockResolvedValue({ id: 'workflow-1' }) }, workflow_states: { findMany: vi.fn().mockResolvedValue([{ id: 'from', name: 'Draft' }, { id: 'to', name: 'Submitted' }]) }, roles: { findFirst: vi.fn().mockResolvedValue(null) } };
    const service = new WorkflowTransitionsService(prisma as any);
    await expect(service.createTransition('org-1', 'workflow-1', 'user-1', { from_state_id: 'from', to_state_id: 'to', name: 'Submit', allowed_role_id: 'role-other' })).rejects.toThrow('Transition role not found');
  });
});
