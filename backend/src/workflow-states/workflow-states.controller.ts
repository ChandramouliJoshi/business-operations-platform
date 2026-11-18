
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { WorkflowStatesService } from './workflow-states.service.js';
import { CreateWorkflowStateDto } from './dto/create-workflow-state.dto.js';
import { UpdateWorkflowStateDto } from './dto/update-workflow-state.dto.js';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';

@Controller('organizations/:organizationId/workflows/:workflowId/states')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkflowStatesController {
  constructor(
    private readonly workflowStatesService: WorkflowStatesService,
  ) {}

  // CREATE STATE
  @Post()
  @RequirePermission('workflow_states.create')
  createState(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Body() dto: CreateWorkflowStateDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.workflowStatesService.createState(
      organizationId,
      workflowId,
      req.user.userId,
      dto,
    );
  }

  // GET ALL STATES
  @Get()
  @RequirePermission('workflow_states.view')
  getStates(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
  ) {
    return this.workflowStatesService.getStates(
      organizationId,
      workflowId,
    );
  }

  // UPDATE STATE
  @Patch(':stateId')
  @RequirePermission('workflow_states.update')
  updateState(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Param('stateId') stateId: string,
    @Body() dto: UpdateWorkflowStateDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.workflowStatesService.updateState(
      organizationId,
      workflowId,
      stateId,
      req.user.userId,
      dto,
    );
  }

  // DELETE STATE
  @Delete(':stateId')
  @RequirePermission('workflow_states.delete')
  deleteState(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Param('stateId') stateId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.workflowStatesService.deleteState(
      organizationId,
      workflowId,
      stateId,
      req.user.userId,
    );
  }
}
