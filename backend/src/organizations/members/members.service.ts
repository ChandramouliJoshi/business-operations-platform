
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async addMember(
    organizationId: string,
    userId: string,
    roleId: string,
    departmentId?: string,
  ) {
    // 1. Check organization exists
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // 2. Check user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Check role belongs to this organization
    const role = await this.prisma.roles.findFirst({
      where: {
        id: roleId,
        organization_id: organizationId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!role) {
      throw new NotFoundException(
        'Role not found in this organization',
      );
    }

    // 4. Prevent assigning the Owner role through member creation
    if (role.name.toLowerCase() === 'owner') {
      throw new ForbiddenException(
        'The Owner role cannot be assigned through member creation',
      );
    }

    // 5. If a department is provided, verify organization ownership
    if (departmentId) {
      const department = await this.prisma.departments.findFirst({
        where: {
          id: departmentId,
          organization_id: organizationId,
        },
        select: { id: true },
      });

      if (!department) {
        throw new NotFoundException(
          'Department not found in this organization',
        );
      }
    }

    // 6. Check if user is already a member
    const existingMember =
      await this.prisma.organization_members.findUnique({
        where: {
          organization_id_user_id: {
            organization_id: organizationId,
            user_id: userId,
          },
        },
      });

    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    // 7. Create member
    try {
      return await this.prisma.organization_members.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          role_id: roleId,
          department_id: departmentId,
          status: 'active',
        },
        select: {
          id: true,
          organization_id: true,
          user_id: true,
          role_id: true,
          department_id: true,
          status: true,
          joined_at: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          roles: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          departments: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'User is already a member of this organization',
        );
      }

      throw error;
    }
  }

  async getMembers(organizationId: string) {
    // 1. Check organization exists
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // 2. Return organization members with safe user fields
    return this.prisma.organization_members.findMany({
      where: {
        organization_id: organizationId,
      },
      select: {
        id: true,
        organization_id: true,
        user_id: true,
        role_id: true,
        department_id: true,
        status: true,
        joined_at: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        joined_at: 'asc',
      },
    });
  }

  async getMember(organizationId: string, memberId: string) {
    const member = await this.prisma.organization_members.findFirst({
      where: { id: memberId, organization_id: organizationId },
      select: { id: true, organization_id: true, user_id: true, role_id: true, department_id: true, status: true, joined_at: true, users: { select: { id: true, name: true, email: true } }, roles: { select: { id: true, name: true, description: true } }, departments: { select: { id: true, name: true } } },
    });
    if (!member) throw new NotFoundException('Member not found in this organization');
    return member;
  }

  async updateMember(organizationId: string, memberId: string, actorId: string, dto: UpdateMemberDto) {
    const member = await this.prisma.organization_members.findFirst({ where: { id: memberId, organization_id: organizationId }, include: { roles: true } });
    if (!member) throw new NotFoundException('Member not found in this organization');
    if (dto.roleId) {
      const role = await this.prisma.roles.findFirst({ where: { id: dto.roleId, organization_id: organizationId } });
      if (!role) throw new NotFoundException('Role not found in this organization');
      if (member.roles.name.toLowerCase() === 'owner' && role.name.toLowerCase() !== 'owner') await this.assertNotLastOwner(organizationId, memberId);
    }
    if (dto.departmentId) {
      const department = await this.prisma.departments.findFirst({ where: { id: dto.departmentId, organization_id: organizationId }, select: { id: true } });
      if (!department) throw new NotFoundException('Department not found in this organization');
    }
    const updated = await this.prisma.organization_members.update({ where: { id: memberId }, data: { ...(dto.roleId !== undefined && { role_id: dto.roleId }), ...(dto.departmentId !== undefined && { department_id: dto.departmentId }), ...(dto.status !== undefined && { status: dto.status }) }, select: { id: true, user_id: true, role_id: true, department_id: true, status: true, users: { select: { id: true, name: true, email: true } }, roles: { select: { id: true, name: true } }, departments: { select: { id: true, name: true } } } });
    await this.prisma.audit_logs.create({ data: { organization_id: organizationId, user_id: actorId, action: 'member.updated', entity_type: 'organization_member', entity_id: memberId, metadata: { updated_fields: Object.keys(dto) } } });
    return updated;
  }

  async removeMember(organizationId: string, memberId: string, actorId: string) {
    const member = await this.prisma.organization_members.findFirst({ where: { id: memberId, organization_id: organizationId }, include: { roles: true } });
    if (!member) throw new NotFoundException('Member not found in this organization');
    if (member.roles.name.toLowerCase() === 'owner') await this.assertNotLastOwner(organizationId, memberId);
    await this.prisma.$transaction(async (tx) => {
      await tx.audit_logs.create({ data: { organization_id: organizationId, user_id: actorId, action: 'member.removed', entity_type: 'organization_member', entity_id: memberId, metadata: { user_id: member.user_id } } });
      await tx.organization_members.delete({ where: { id: memberId } });
    });
    return { message: 'Member removed successfully' };
  }

  private async assertNotLastOwner(organizationId: string, memberId: string) {
    const ownerCount = await this.prisma.organization_members.count({ where: { organization_id: organizationId, status: 'active', roles: { name: { equals: 'Owner', mode: 'insensitive' } } } });
    if (ownerCount <= 1) throw new ForbiddenException('An organization must retain at least one active Owner');
    return memberId;
  }
}
