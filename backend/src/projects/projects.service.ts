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

    return this.prisma.projects.create({
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