
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

import { AuditLogsController } from './audit-logs.controller.js';
import { AuditLogsService } from './audit-logs.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, PermissionsGuard],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
