import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(
    organizationId: string,
    name: string,
    description?: string,
  ) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingRole = await this.prisma.roles.findUnique({
      where: {
        organization_id_name: {
          organization_id: organizationId,
          name,
        },
      },
    });

    if (existingRole) {
      throw new ConflictException(
        'Role already exists in this organization',
      );
    }

    return this.prisma.roles.create({
      data: {
        organization_id: organizationId,
        name,
        description,
      },
    });
  }

  async getRoles(organizationId: string) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.roles.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async assignPermission(
    roleId: string,
    permissionId: string,
  ) {
    const role = await this.prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission = await this.prisma.permissions.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existingMapping =
      await this.prisma.role_permissions.findUnique({
        where: {
          role_id_permission_id: {
            role_id: roleId,
            permission_id: permissionId,
          },
        },
      });

    if (existingMapping) {
      throw new ConflictException(
        'Permission is already assigned to this role',
      );
    }

    return this.prisma.role_permissions.create({
      data: {
        role_id: roleId,
        permission_id: permissionId,
      },
    });
  }
  async getRolePermissions(roleId: string) {
    const role = await this.prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role_permissions.findMany({
      where: {
        role_id: roleId,
      },
      include: {
        permissions: true,
      },
    });
  }
}
