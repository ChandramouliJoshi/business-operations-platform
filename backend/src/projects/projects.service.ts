
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(
    organizationId: string,
    name: string,
    createdBy: string,
    description?: string,
    managerId?: string,
    status?: string,
    startDate?: string,
    deadline?: string,
  ) {
    // Check organization exists
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check creator belongs to organization
    const creator = await this.prisma.organization_members.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: organizationId,
          user_id: createdBy,
        },
      },
    });

    if (!creator) {
      throw new ConflictException(
        'Project creator is not a member of this organization',
      );
    }

    // If manager is provided, check manager belongs to organization
    if (managerId) {
      const manager = await this.prisma.organization_members.findUnique({
        where: {
          organization_id_user_id: {
            organization_id: organizationId,
            user_id: managerId,
          },
        },
      });

      if (!manager) {
        throw new ConflictException(
          'Project manager is not a member of this organization',
        );
      }
    }

    // Create project and audit log atomically
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.projects.create({
        data: {
          organization_id: organizationId,
          name,
          description,
          created_by: createdBy,
          manager_id: managerId,
          status: status ?? 'active',
          start_date: startDate ? new Date(startDate) : undefined,
          deadline: deadline ? new Date(deadline) : undefined,
        },
      });

      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: createdBy,
          action: 'project.created',
          entity_type: 'project',
          entity_id: project.id,
          metadata: {
            name: project.name,
            status: project.status,
            manager_id: project.manager_id,
            start_date: project.start_date?.toISOString() ?? null,
            deadline: project.deadline?.toISOString() ?? null,
          },
        },
      });

      return project;
    });
  }

  async getProjects(organizationId: string) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.projects.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
