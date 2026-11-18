
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAuditLogDto } from './dto/create-audit-log.dto.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create an audit log.
  async createAuditLog(dto: CreateAuditLogDto) {
    return this.prisma.audit_logs.create({
      data: {
        organization_id: dto.organization_id,
        user_id: dto.user_id,
        action: dto.action,
        entity_type: dto.entity_type,
        entity_id: dto.entity_id,
        metadata: dto.metadata ?? {},
      },
    });
  }

  // Get all audit logs for an organization.
  async getOrganizationLogs(
    organizationId: string,
    filters?: {
      userId?: string;
      action?: string;
      entityType?: string;
    },
  ) {
    return this.prisma.audit_logs.findMany({
      where: {
        organization_id: organizationId,
        ...(filters?.userId && {
          user_id: filters.userId,
        }),
        ...(filters?.action && {
          action: filters.action,
        }),
        ...(filters?.entityType && {
          entity_type: filters.entityType,
        }),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get audit history for a particular entity.
  async getEntityLogs(
    organizationId: string,
    entityType: string,
    entityId: string,
  ) {
    return this.prisma.audit_logs.findMany({
      where: {
        organization_id: organizationId,
        entity_type: entityType,
        entity_id: entityId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get a single audit log.
  async getAuditLog(
    organizationId: string,
    auditLogId: string,
  ) {
    const log = await this.prisma.audit_logs.findFirst({
      where: {
        id: auditLogId,
        organization_id: organizationId,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }
}
