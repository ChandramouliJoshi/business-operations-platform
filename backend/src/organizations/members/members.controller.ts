
import {
  Body,
  Delete,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';
import { PermissionsGuard } from '../permissions/permissions.guard.js';
import { RequirePermission } from '../permissions/permissions.decorator.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';

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

  @Get(':memberId')
  @RequirePermission('members.view')
  getMember(@Param('organizationId') organizationId: string, @Param('memberId') memberId: string) {
    return this.membersService.getMember(organizationId, memberId);
  }

  @Patch(':memberId')
  @RequirePermission('members.manage')
  updateMember(@Param('organizationId') organizationId: string, @Param('memberId') memberId: string, @Body() dto: UpdateMemberDto, @Req() req: any) {
    return this.membersService.updateMember(organizationId, memberId, req.user.userId, dto);
  }

  @Delete(':memberId')
  @RequirePermission('members.manage')
  removeMember(@Param('organizationId') organizationId: string, @Param('memberId') memberId: string, @Req() req: any) {
    return this.membersService.removeMember(organizationId, memberId, req.user.userId);
  }
}
