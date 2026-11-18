
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
    projectId: string,
    createdBy: string,
    title: string,
    description?: string,
    assignedTo?: string,
    status?: string,
    priority?: string,
    deadline?: string,
  ) {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const creator = await this.prisma.organization_members.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: project.organization_id,
          user_id: createdBy,
        },
      },
    });

    if (!creator) {
      throw new ConflictException(
        'Task creator is not a member of this organization',
      );
    }

    if (assignedTo) {
      const assignee =
        await this.prisma.organization_members.findUnique({
          where: {
            organization_id_user_id: {
              organization_id: project.organization_id,
              user_id: assignedTo,
            },
          },
        });

      if (!assignee) {
        throw new ConflictException(
          'Task assignee is not a member of this organization',
        );
      }
    }

    // Create task and audit log atomically
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
          organization_id: project.organization_id,
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

  // Get all tasks belonging to a project
  async getTasks(projectId: string) {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.tasks.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: 'desc' },
    });
  }

  // Update a task
  async updateTask(
    taskId: string,
    userId: string,
    title?: string,
    description?: string,
    assignedTo?: string,
    status?: string,
    priority?: string,
    deadline?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.tasks.findUnique({
        where: { id: taskId },
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
        throw new NotFoundException('Task not found');
      }

      if (assignedTo) {
        const assignee =
          await tx.organization_members.findUnique({
            where: {
              organization_id_user_id: {
                organization_id: task.projects.organization_id,
                user_id: assignedTo,
              },
            },
          });

        if (!assignee) {
          throw new ConflictException(
            'Task assignee is not a member of this organization',
          );
        }
      }

      const updateData = {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(assignedTo !== undefined && { assigned_to: assignedTo }),
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

      const updatedTask = await tx.tasks.update({
        where: { id: taskId },
        data: updateData,
      });

      await tx.audit_logs.create({
        data: {
          organization_id: task.projects.organization_id,
          user_id: userId,
          action: 'task.updated',
          entity_type: 'task',
          entity_id: taskId,
          metadata: {
            project_id: task.project_id,
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

  // Delete a task
  async deleteTask(
    taskId: string,
    projectId: string,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.tasks.findFirst({
        where: {
          id: taskId,
          project_id: projectId,
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
          'Task not found in this project',
        );
      }

      // Record the deletion before removing the task.
      // Both operations are part of the same transaction.
      await tx.audit_logs.create({
        data: {
          organization_id: task.projects.organization_id,
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

      await tx.tasks.delete({
        where: { id: taskId },
      });

      return {
        message: 'Task deleted successfully',
      };
    });
  }
}
