
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a task
  async createTask(
    organizationId: string,
    projectId: string,
    createdBy: string,
    title: string,
    description?: string,
    assignedTo?: string,
    status?: string,
    priority?: string,
    deadline?: string,
  ) {
    // 1. Verify project belongs to the requested organization
    const project = await this.prisma.projects.findFirst({
      where: {
        id: projectId,
        organization_id: organizationId,
      },
      select: {
        id: true,
        organization_id: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found in this organization',
      );
    }

    // 2. Verify creator is an active organization member
    const creator = await this.prisma.organization_members.findFirst({
      where: {
        organization_id: organizationId,
        user_id: createdBy,
        status: 'active',
      },
      select: { id: true },
    });

    if (!creator) {
      throw new ConflictException(
        'Task creator is not an active member of this organization',
      );
    }

    // 3. Verify assignee is an active organization member
    if (assignedTo) {
      const assignee =
        await this.prisma.organization_members.findFirst({
          where: {
            organization_id: organizationId,
            user_id: assignedTo,
            status: 'active',
          },
          select: { id: true },
        });

      if (!assignee) {
        throw new ConflictException(
          'Task assignee is not an active member of this organization',
        );
      }
    }

    // 4. Create task and audit log atomically
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.tasks.create({
        data: {
          project_id: projectId,
          created_by: createdBy,
          assigned_to: assignedTo,
          title,
          description,
          status: status ?? 'todo',
          priority: priority ?? 'medium',
          deadline: deadline ? new Date(deadline) : undefined,
        },
      });

      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: createdBy,
          action: 'task.created',
          entity_type: 'task',
          entity_id: task.id,
          metadata: {
            project_id: projectId,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigned_to: task.assigned_to,
            deadline: task.deadline?.toISOString() ?? null,
          },
        },
      });

      return task;
    });
  }

  // Get all tasks belonging to a project in an organization
  async getTasks(
    organizationId: string,
    projectId: string,
  ) {
    const project = await this.prisma.projects.findFirst({
      where: {
        id: projectId,
        organization_id: organizationId,
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found in this organization',
      );
    }

    return this.prisma.tasks.findMany({
      where: {
        project_id: projectId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Update a task within its organization and project
  async updateTask(
    organizationId: string,
    projectId: string,
    taskId: string,
    userId: string,
    title?: string,
    description?: string | null,
    assignedTo?: string | null,
    status?: string,
    priority?: string,
    deadline?: string | null,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find task only if it belongs to this project and organization
      const task = await tx.tasks.findFirst({
        where: {
          id: taskId,
          project_id: projectId,
          projects: {
            organization_id: organizationId,
          },
        },
        include: {
          projects: {
            select: {
              id: true,
              organization_id: true,
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException(
          'Task not found in this project and organization',
        );
      }

      // 2. Verify assignee if a new user is provided
      if (assignedTo) {
        const assignee =
          await tx.organization_members.findFirst({
            where: {
              organization_id: organizationId,
              user_id: assignedTo,
              status: 'active',
            },
            select: { id: true },
          });

        if (!assignee) {
          throw new ConflictException(
            'Task assignee is not an active member of this organization',
          );
        }
      }

      // 3. Build update data using explicitly provided fields
      const updateData = {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(assignedTo !== undefined && {
          assigned_to: assignedTo,
        }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(deadline !== undefined && {
          deadline: deadline ? new Date(deadline) : null,
        }),
      };

      if (Object.keys(updateData).length === 0) {
        throw new ConflictException(
          'At least one field must be provided for update',
        );
      }

      // 4. Update task
      const updatedTask = await tx.tasks.update({
        where: { id: taskId },
        data: updateData,
      });

      // 5. Record audit log
      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          action: 'task.updated',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            project_id: projectId,
            updated_fields: Object.keys(updateData),
            previous_title: task.title,
            new_title: updatedTask.title,
            previous_status: task.status,
            new_status: updatedTask.status,
          },
        },
      });

      return updatedTask;
    });
  }

  // Delete a task within its organization and project
  async deleteTask(
    organizationId: string,
    projectId: string,
    taskId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find task only if it belongs to this project and organization
      const task = await tx.tasks.findFirst({
        where: {
          id: taskId,
          project_id: projectId,
          projects: {
            organization_id: organizationId,
          },
        },
        include: {
          projects: {
            select: {
              organization_id: true,
            },
          },
        },
      });

      if (!task) {
        throw new NotFoundException(
          'Task not found in this project and organization',
        );
      }

      // 2. Record deletion before removing the task
      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          action: 'task.deleted',
          entity_type: 'task',
          entity_id: task.id,
          metadata: {
            project_id: task.project_id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            assigned_to: task.assigned_to,
          },
        },
      });

      // 3. Delete task
      await tx.tasks.delete({
        where: {
          id: taskId,
        },
      });

      return {
        message: 'Task deleted successfully',
      };
    });
  }
}
