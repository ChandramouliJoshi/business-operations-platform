
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

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
}