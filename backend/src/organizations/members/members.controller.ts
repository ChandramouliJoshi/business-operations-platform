
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';
import { PermissionsGuard } from '../permissions/permissions.guard.js';
import { RequirePermission } from '../permissions/permissions.decorator.js';

@Controller('organizations/:organizationId/members')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
  ) {}

  @Post()
  @RequirePermission('members.create')
  async addMember(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      userId: string;
      roleId: string;
      departmentId?: string;
    },
  ) {
    return this.membersService.addMember(
      organizationId,
      body.userId,
      body.roleId,
      body.departmentId,
    );
  }

  @Get()
  @RequirePermission('members.view')
  async getMembers(
    @Param('organizationId') organizationId: string,
  ) {
    return this.membersService.getMembers(organizationId);
  }
}