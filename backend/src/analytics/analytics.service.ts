import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(organizationId: string, userId: string) {
    const organization = await this.prisma.organizations.findUnique({ where: { id: organizationId }, select: { id: true } });
    if (!organization) throw new NotFoundException('Organization not found');
    const now = new Date();
    const taskScope = { projects: { organization_id: organizationId } };
    const [totalProjects, activeProjects, completedProjects, totalTasks, completedTasks, pendingTasks, overdueTasks, statusGroups, priorityGroups, workloadGroups, pendingRequests, pendingApprovals, activity, notifications] = await Promise.all([
      this.prisma.projects.count({ where: { organization_id: organizationId } }),
      this.prisma.projects.count({ where: { organization_id: organizationId, status: { notIn: ['completed', 'archived'] } } }),
      this.prisma.projects.count({ where: { organization_id: organizationId, status: 'completed' } }),
      this.prisma.tasks.count({ where: taskScope }),
      this.prisma.tasks.count({ where: { ...taskScope, status: 'done' } }),
      this.prisma.tasks.count({ where: { ...taskScope, status: { not: 'done' } } }),
      this.prisma.tasks.count({ where: { ...taskScope, deadline: { lt: now }, status: { not: 'done' } } }),
      this.prisma.tasks.groupBy({ by: ['status'], where: taskScope, _count: { _all: true } }),
      this.prisma.tasks.groupBy({ by: ['priority'], where: taskScope, _count: { _all: true } }),
      this.prisma.tasks.groupBy({ by: ['assigned_to'], where: { ...taskScope, assigned_to: { not: null } }, _count: { _all: true } }),
      this.prisma.requests.count({ where: { organization_id: organizationId, workflow_states: { is_final: false } } }),
      this.prisma.approvals.count({ where: { status: 'pending', requests: { is: { organization_id: organizationId } } } }),
      this.prisma.audit_logs.findMany({ where: { organization_id: organizationId }, orderBy: { created_at: 'desc' }, take: 8, include: { users: { select: { id: true, name: true } } } }),
      this.prisma.notifications.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: 5 }),
    ]);
    const assignedIds = workloadGroups.map((group) => group.assigned_to).filter((id): id is string => Boolean(id));
    const users = assignedIds.length ? await this.prisma.users.findMany({ where: { id: { in: assignedIds } }, select: { id: true, name: true } }) : [];
    const names = new Map(users.map((user) => [user.id, user.name]));
    return {
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
      tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks, overdue: overdueTasks, byStatus: statusGroups.map((group) => ({ status: group.status, count: group._count._all })), byPriority: priorityGroups.map((group) => ({ priority: group.priority, count: group._count._all })) },
      workload: workloadGroups.map((group) => ({ userId: group.assigned_to, name: group.assigned_to ? names.get(group.assigned_to) ?? 'Unknown member' : 'Unassigned', count: group._count._all })),
      requests: { pending: pendingRequests }, approvals: { pending: pendingApprovals }, activity, notifications,
    };
  }
}
