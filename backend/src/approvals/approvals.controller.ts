
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

import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

import { ApprovalsService } from './approvals.service.js';
import { CreateApprovalDto } from './dto/create-approval.dto.js';
import { UpdateApprovalDecisionDto } from './dto/update-approval-decision.dto.js';

@Controller('organizations/:organizationId/approvals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApprovalsController {
  constructor(
    private readonly approvalsService: ApprovalsService,
  ) {}

  // Assign an approval.
  @Post()
  @RequirePermission('approvals.create')
  createApproval(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateApprovalDto,
  ) {
    return this.approvalsService.createApproval(
      organizationId,
      dto,
    );
  }

  // Get all approvals in an organization.
  @Get()
  @RequirePermission('approvals.view')
  getApprovals(
    @Param('organizationId') organizationId: string,
  ) {
    return this.approvalsService.getApprovals(organizationId);
  }

  // Get approvals belonging to a specific request.
  @Get('requests/:requestId')
  @RequirePermission('approvals.view')
  getRequestApprovals(
    @Param('organizationId') organizationId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.approvalsService.getRequestApprovals(
      organizationId,
      requestId,
    );
  }

  // Approve or reject an assigned approval.
  @Patch(':approvalId/decision')
  @RequirePermission('approvals.decide')
  decideApproval(
    @Param('organizationId') organizationId: string,
    @Param('approvalId') approvalId: string,
    @Req() req: any,
    @Body() dto: UpdateApprovalDecisionDto,
  ) {
    return this.approvalsService.decideApproval(
      organizationId,
      approvalId,
      req.user.userId,
      dto,
    );
  }
}
