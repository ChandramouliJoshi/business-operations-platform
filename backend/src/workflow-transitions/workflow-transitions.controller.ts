
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { WorkflowTransitionsService } from './workflow-transitions.service.js';
import { CreateWorkflowTransitionDto } from './dto/create-workflow-transition.dto.js';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';

@Controller(
  'organizations/:organizationId/workflows/:workflowId/transitions',
)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkflowTransitionsController {
  constructor(
    private readonly workflowTransitionsService: WorkflowTransitionsService,
  ) {}

  // CREATE TRANSITION
  @Post()
  @RequirePermission('workflow_transitions.create')
  createTransition(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Body() dto: CreateWorkflowTransitionDto,
  ) {
    return this.workflowTransitionsService.createTransition(
      organizationId,
      workflowId,
      dto,
    );
  }

  // GET ALL TRANSITIONS
  @Get()
  @RequirePermission('workflow_transitions.view')
  getTransitions(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
  ) {
    return this.workflowTransitionsService.getTransitions(
      organizationId,
      workflowId,
    );
  }

  // DELETE TRANSITION
  @Delete(':transitionId')
  @RequirePermission('workflow_transitions.delete')
  deleteTransition(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Param('transitionId') transitionId: string,
  ) {
    return this.workflowTransitionsService.deleteTransition(
      organizationId,
      workflowId,
      transitionId,
    );
  }
}
