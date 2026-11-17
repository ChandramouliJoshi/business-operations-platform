
import { Module } from '@nestjs/common';

import { WorkflowTransitionsController } from './workflow-transitions.controller.js';
import { WorkflowTransitionsService } from './workflow-transitions.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowTransitionsController],
  providers: [WorkflowTransitionsService, PermissionsGuard],
})
export class WorkflowTransitionsModule {}
