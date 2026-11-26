import { describe, expect, it, vi } from 'vitest';
import { MembersService } from './members/members.service.js';
import { DepartmentsService } from './departments/departments.service.js';
import { RolesService } from './roles/roles.service.js';

describe('organization management tenancy safeguards', () => {
  it('scopes member detail lookups to the requested organization', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new MembersService({ organization_members: { findFirst } } as any);
    await expect(service.getMember('org-a', 'member-b')).rejects.toThrow('Member not found');
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'member-b', organization_id: 'org-a' } }));
  });

  it('scopes department detail lookups to the requested organization', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new DepartmentsService({ departments: { findFirst } } as any);
    await expect(service.getDepartment('org-a', 'department-b')).rejects.toThrow('Department not found');
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'department-b', organization_id: 'org-a' } }));
  });

  it('rejects permission assignment to a role from another organization', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new RolesService({ roles: { findFirst }, permissions: { findUnique: vi.fn() } } as any);
    await expect(service.assignPermission('org-a', 'role-b', 'permission-c')).rejects.toThrow('Role not found');
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'role-b', organization_id: 'org-a' } }));
  });

  it('prevents removing the last active owner', async () => {
    const service = new MembersService({
      organization_members: {
        findFirst: vi.fn().mockResolvedValue({ id: 'member-1', user_id: 'user-1', roles: { name: 'Owner' } }),
        count: vi.fn().mockResolvedValue(1),
      },
    } as any);
    await expect(service.removeMember('org-a', 'member-1', 'actor-1')).rejects.toThrow('at least one active Owner');
  });

  it('updates a department only after finding it in the requested organization', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'department-1', name: 'Operations' });
    const service = new DepartmentsService({ departments: { findFirst: vi.fn().mockResolvedValue({ id: 'department-1' }), update } } as any);
    await expect(service.updateDepartment('org-a', 'department-1', { name: 'Operations' })).resolves.toEqual({ id: 'department-1', name: 'Operations' });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'department-1' } }));
  });
});
