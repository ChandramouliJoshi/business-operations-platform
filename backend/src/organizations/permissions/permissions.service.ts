import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPermission(
    name: string,
    description?: string,
  ) {
    const existingPermission =
      await this.prisma.permissions.findUnique({
        where: { name },
      });

    if (existingPermission) {
      throw new ConflictException(
        'Permission already exists',
      );
    }

    return this.prisma.permissions.create({
      data: {
        name,
        description,
      },
    });
  }

  async getPermissions() {
    return this.prisma.permissions.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}