
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

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

  async getDepartment(organizationId: string, departmentId: string) {
    const department = await this.prisma.departments.findFirst({ where: { id: departmentId, organization_id: organizationId }, include: { organization_members: { select: { id: true, user_id: true, status: true, users: { select: { name: true, email: true } } } } } });
    if (!department) throw new NotFoundException('Department not found in this organization');
    return department;
  }

  async updateDepartment(organizationId: string, departmentId: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.departments.findFirst({ where: { id: departmentId, organization_id: organizationId }, select: { id: true } });
    if (!department) throw new NotFoundException('Department not found in this organization');
    try { return await this.prisma.departments.update({ where: { id: departmentId }, data: { ...(dto.name !== undefined && { name: dto.name }), ...(dto.description !== undefined && { description: dto.description }) } }); }
    catch (error: unknown) { if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ConflictException('Department already exists in this organization'); throw error; }
  }

  async deleteDepartment(organizationId: string, departmentId: string) {
    const department = await this.prisma.departments.findFirst({ where: { id: departmentId, organization_id: organizationId }, select: { id: true } });
    if (!department) throw new NotFoundException('Department not found in this organization');
    await this.prisma.departments.delete({ where: { id: departmentId } });
    return { message: 'Department deleted successfully' };
  }
}
