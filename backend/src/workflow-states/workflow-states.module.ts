
import { Module } from '@nestjs/common';
import { WorkflowStatesController } from './workflow-states.controller.js';
import { WorkflowStatesService } from './workflow-states.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowStatesController],
  providers: [WorkflowStatesService, PermissionsGuard],
})
export class WorkflowStatesModule {}
