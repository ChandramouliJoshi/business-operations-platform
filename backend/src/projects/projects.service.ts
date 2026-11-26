
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

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
    // 1. Check organization exists
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // 2. Check creator is an active organization member
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
        'Project creator is not an active member of this organization',
      );
    }

    // 3. If manager is provided, check active membership
    if (managerId) {
      const manager = await this.prisma.organization_members.findFirst({
        where: {
          organization_id: organizationId,
          user_id: managerId,
          status: 'active',
        },
        select: { id: true },
      });

      if (!manager) {
        throw new ConflictException(
          'Project manager is not an active member of this organization',
        );
      }
    }

    // 4. Create project and audit log atomically
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
      select: { id: true },
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

  async getProject(organizationId: string, projectId: string) {
    const project = await this.prisma.projects.findFirst({
      where: { id: projectId, organization_id: organizationId },
      include: { tasks: { orderBy: { created_at: 'desc' } } },
    });
    if (!project) throw new NotFoundException('Project not found in this organization');
    return project;
  }

  async updateProject(organizationId: string, projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.projects.findFirst({ where: { id: projectId, organization_id: organizationId }, select: { id: true } });
    if (!project) throw new NotFoundException('Project not found in this organization');
    if (dto.managerId) {
      const manager = await this.prisma.organization_members.findFirst({ where: { organization_id: organizationId, user_id: dto.managerId, status: 'active' }, select: { id: true } });
      if (!manager) throw new ConflictException('Project manager is not an active member of this organization');
    }
    const updated = await this.prisma.projects.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.managerId !== undefined && { manager_id: dto.managerId }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.startDate !== undefined && { start_date: dto.startDate ? new Date(dto.startDate) : null }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
      },
    });
    await this.prisma.audit_logs.create({ data: { organization_id: organizationId, user_id: userId, action: 'project.updated', entity_type: 'project', entity_id: projectId, metadata: { updated_fields: Object.keys(dto) } } });
    return updated;
  }

  async deleteProject(organizationId: string, projectId: string, userId: string) {
    const project = await this.prisma.projects.findFirst({ where: { id: projectId, organization_id: organizationId }, select: { id: true, name: true, status: true } });
    if (!project) throw new NotFoundException('Project not found in this organization');
    await this.prisma.$transaction(async (tx) => {
      await tx.audit_logs.create({ data: { organization_id: organizationId, user_id: userId, action: 'project.deleted', entity_type: 'project', entity_id: projectId, metadata: { name: project.name, status: project.status } } });
      await tx.projects.delete({ where: { id: projectId } });
    });
    return { message: 'Project deleted successfully' };
  }
}
