
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

import { AuditLogsService } from './audit-logs.service.js';

@Controller('organizations/:organizationId/audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // Get all audit logs for an organization with optional filters.
  @Get()
  @RequirePermission('audit_logs.view')
  getOrganizationLogs(
    @Param('organizationId') organizationId: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.auditLogsService.getOrganizationLogs(
      organizationId,
      {
        userId,
        action,
        entityType,
      },
    );
  }

  // Get audit history for a specific entity.
  @Get('entity/:entityType/:entityId')
  @RequirePermission('audit_logs.view')
  getEntityLogs(
    @Param('organizationId') organizationId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.getEntityLogs(
      organizationId,
      entityType,
      entityId,
    );
  }

  // Get a specific audit log.
  @Get(':auditLogId')
  @RequirePermission('audit_logs.view')
  getAuditLog(
    @Param('organizationId') organizationId: string,
    @Param('auditLogId') auditLogId: string,
  ) {
    return this.auditLogsService.getAuditLog(
      organizationId,
      auditLogId,
    );
  }
}
