import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

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
    // Check project exists
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check creator belongs to the project organization
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

    // If assignedTo is provided, check assignee belongs to same organization
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

    return this.prisma.tasks.create({
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
  }

  async getTasks(projectId: string) {
    const project = await this.prisma.projects.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
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

  async updateTask(
    taskId: string,
    title?: string,
    description?: string,
    assignedTo?: string,
    status?: string,
    priority?: string,
    deadline?: string,
  ) {
    // Check task exists
    const task = await this.prisma.tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If assignedTo is provided, check assignee belongs
    // to the same organization as the task's project
    if (assignedTo) {
      const project = await this.prisma.projects.findUnique({
        where: { id: task.project_id },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

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

    return this.prisma.tasks.update({
      where: { id: taskId },
      data: {
        title,
        description,
        assigned_to: assignedTo,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });
  }
}