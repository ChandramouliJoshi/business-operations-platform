
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

    try {
      return await this.prisma.roles.create({
        data: {
          organization_id: organizationId,
          name,
          description,
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
          'Role already exists in this organization',
        );
      }

      throw error;
    }
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
    organizationId: string,
    roleId: string,
    permissionId: string,
  ) {
    const role = await this.prisma.roles.findFirst({
      where: {
        id: roleId,
        organization_id: organizationId,
      },
    });

    if (!role) {
      throw new NotFoundException(
        'Role not found in this organization',
      );
    }

    const permission = await this.prisma.permissions.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    try {
      return await this.prisma.role_permissions.create({
        data: {
          role_id: roleId,
          permission_id: permissionId,
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
          'Permission is already assigned to this role',
        );
      }

      throw error;
    }
  }

  async getRolePermissions(
    organizationId: string,
    roleId: string,
  ) {
    const role = await this.prisma.roles.findFirst({
      where: {
        id: roleId,
        organization_id: organizationId,
      },
    });

    if (!role) {
      throw new NotFoundException(
        'Role not found in this organization',
      );
    }

    return this.prisma.role_permissions.findMany({
      where: {
        role_id: roleId,
      },
      include: {
        permissions: true,
      },
      orderBy: {
        permissions: {
          name: 'asc',
        },
      },
    });
  }
}
