
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

import { WorkflowsService } from './workflows.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';

import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

import { CreateWorkflowDto } from './dto/create-workflow.dto.js';
import { UpdateWorkflowDto } from './dto/update-workflow.dto.js';

@Controller('organizations/:organizationId/workflows')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
  ) {}

  // Create workflow
  @Post()
  @RequirePermission('workflows.create')
  async createWorkflow(
    @Param('organizationId') organizationId: string,
    @Body() body: CreateWorkflowDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.workflowsService.createWorkflow(
      organizationId,
      req.user.userId,
      body.name,
      body.entity_type,
      body.description,
    );
  }

  // Get all workflows
  @Get()
  @RequirePermission('workflows.view')
  async getWorkflows(
    @Param('organizationId') organizationId: string,
  ) {
    return this.workflowsService.getWorkflows(
      organizationId,
    );
  }

  // Get workflow details
  @Get(':workflowId')
  @RequirePermission('workflows.view')
  async getWorkflow(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
  ) {
    return this.workflowsService.getWorkflow(
      organizationId,
      workflowId,
    );
  }

  // Update workflow
  @Patch(':workflowId')
  @RequirePermission('workflows.update')
  async updateWorkflow(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: UpdateWorkflowDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.workflowsService.updateWorkflow(
      organizationId,
      workflowId,
      req.user.userId,
      body.name,
      body.description,
      body.entity_type,
      body.is_active,
    );
  }

  // Delete workflow
  @Delete(':workflowId')
  @RequirePermission('workflows.delete')
  async deleteWorkflow(
    @Param('organizationId') organizationId: string,
    @Param('workflowId') workflowId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.workflowsService.deleteWorkflow(
      organizationId,
      workflowId,
      req.user.userId,
    );
  }
}
