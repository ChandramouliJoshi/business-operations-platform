
import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller.js';
import { WorkflowsService } from './workflows.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, PermissionsGuard],
})
export class WorkflowsModule {}
