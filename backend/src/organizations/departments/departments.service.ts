
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(
    organizationId: string,
    name: string,
    description?: string,
  ) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existingDepartment =
      await this.prisma.departments.findUnique({
        where: {
          organization_id_name: {
            organization_id: organizationId,
            name,
          },
        },
      });

    if (existingDepartment) {
      throw new ConflictException(
        'Department already exists in this organization',
      );
    }

    try {
      return await this.prisma.departments.create({
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
          'Department already exists in this organization',
        );
      }

      throw error;
    }
  }

  async getDepartments(organizationId: string) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.departments.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
