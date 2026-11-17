
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsService } from './approvals.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, PermissionsGuard],
})
export class ApprovalsModule {}
