
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RequestsService } from './requests.service.js';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';

import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

import { CreateRequestDto } from './dto/create-request.dto.js';
import { UpdateRequestDto } from './dto/update-request.dto.js';
import { TransitionRequestDto } from './dto/transition-request.dto.js';

@Controller('organizations/:organizationId/requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
  ) {}

  // Create request
  @Post()
  @RequirePermission('requests.create')
  async createRequest(
    @Param('organizationId') organizationId: string,
    @Body() body: CreateRequestDto,
    @Req() req: any,
  ) {
    return this.requestsService.createRequest(
      organizationId,
      req.user.userId,
      body.workflow_id,
      body.title,
      body.description,
      body.data,
    );
  }

  // Get all requests
  @Get()
  @RequirePermission('requests.view')
  async getRequests(
    @Param('organizationId') organizationId: string,
  ) {
    return this.requestsService.getRequests(
      organizationId,
    );
  }

  // Get request details
  @Get(':requestId')
  @RequirePermission('requests.view')
  async getRequest(
    @Param('organizationId') organizationId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.requestsService.getRequest(
      organizationId,
      requestId,
    );
  }

  // Update request details
  @Patch(':requestId')
  @RequirePermission('requests.update')
  async updateRequest(
    @Param('organizationId') organizationId: string,
    @Param('requestId') requestId: string,
    @Body() body: UpdateRequestDto,
  ) {
    return this.requestsService.updateRequest(
      organizationId,
      requestId,
      body,
    );
  }

  // Transition request to another state
  @Post(':requestId/transition')
  @RequirePermission('requests.transition')
  async transitionRequest(
    @Param('organizationId') organizationId: string,
    @Param('requestId') requestId: string,
    @Body() body: TransitionRequestDto,
  ) {
    return this.requestsService.transitionRequest(
      organizationId,
      requestId,
      body.to_state_id,
    );
  }
}
