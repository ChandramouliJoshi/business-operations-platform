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
}