import { describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service.js';

describe('task update behavior', () => {
  it('updates only the requested fields and records the organization audit event', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'task-1', title: 'Renamed', status: 'done' });
    const auditCreate = vi.fn().mockResolvedValue({});
    const prisma = { $transaction: vi.fn() };
    const transaction = {
      tasks: { findFirst: vi.fn().mockResolvedValue({ id: 'task-1', title: 'Old', status: 'todo', projects: { id: 'project-1', organization_id: 'org-1' } }), update },
      audit_logs: { create: auditCreate },
    };
    prisma.$transaction.mockImplementation(async (callback: any) => {
      return callback(transaction);
    });
    const service = new TasksService(prisma as any);
    const result = await service.updateTask('org-1', 'project-1', 'task-1', 'user-1', 'Renamed', undefined, undefined, 'done');
    expect(result).toEqual({ id: 'task-1', title: 'Renamed', status: 'done' });
    expect(update).toHaveBeenCalledWith({ where: { id: 'task-1' }, data: { title: 'Renamed', status: 'done' } });
    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organization_id: 'org-1', action: 'task.updated' }) }));
  });
});
