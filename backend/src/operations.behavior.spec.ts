import { describe, expect, it, vi } from 'vitest';
import { RequestsService } from './requests/requests.service.js';
import { ApprovalsService } from './approvals/approvals.service.js';

describe('workflow request and approval behavior', () => {
  it('rejects request creation when the workflow has no initial state', async () => {
    const prisma = {
      organization_members: { findFirst: vi.fn().mockResolvedValue({ id: 'member-1' }) },
      workflows: { findFirst: vi.fn().mockResolvedValue({ id: 'workflow-1', organization_id: 'org-1', is_active: true }) },
      workflow_states: { findMany: vi.fn().mockResolvedValue([]) },
    };
    const service = new RequestsService(prisma as any);
    await expect(service.createRequest('org-1', 'user-1', 'workflow-1', 'Leave request')).rejects.toThrow('does not have an initial state');
  });

  it('rejects a request transition that is not configured in the workflow', async () => {
    const prisma = {
      $transaction: vi.fn(),
    };
    prisma.$transaction.mockImplementation(async (callback: any) => callback({
      requests: { findFirst: vi.fn().mockResolvedValue({ id: 'request-1', organization_id: 'org-1', workflow_id: 'workflow-1', current_state_id: 'state-1', workflow_states: { is_final: false, name: 'Draft' }, workflows: { is_active: true } }) },
      workflow_states: { findFirst: vi.fn().mockResolvedValue({ id: 'state-2', workflow_id: 'workflow-1', name: 'Submitted' }) },
      workflow_transitions: { findFirst: vi.fn().mockResolvedValue(null) },
    }));
    const service = new RequestsService(prisma as any);
    await expect(service.transitionRequest('org-1', 'request-1', 'user-1', 'state-2')).rejects.toThrow('transition is not allowed');
  });

  it('rejects an approval decision from a different reviewer', async () => {
    const prisma = { $transaction: vi.fn() };
    prisma.$transaction.mockImplementation(async (callback: any) => callback({
      approvals: { findFirst: vi.fn().mockResolvedValue({ id: 'approval-1', approver_id: 'assigned-user', status: 'pending', request_id: 'request-1', requests: { id: 'request-1', title: 'Request', organization_id: 'org-1', current_state_id: 'state-1' } }) },
    }));
    const service = new ApprovalsService(prisma as any);
    await expect(service.decideApproval('org-1', 'approval-1', 'other-user', { status: 'approved' })).rejects.toThrow('Only the assigned approver');
  });
});
