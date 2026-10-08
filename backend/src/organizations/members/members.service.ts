import {
  Injectable,
  NotFoundException,
  ConflictException,
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
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // 2. Check user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Check role exists
    const role = await this.prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // 4. Check if user is already a member
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

    // 5. Add member
    return this.prisma.organization_members.create({
      data: {
        organization_id: organizationId,
        user_id: userId,
        role_id: roleId,
        department_id: departmentId,
        status: 'active',
      },
    });
  }

  async getMembers(organizationId: string) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization_members.findMany({
      where: {
        organization_id: organizationId,
      },
      include: {
        users: true,
        roles: true,
        departments: true,
      },
      orderBy: {
        joined_at: 'asc',
      },
    });
  }
}