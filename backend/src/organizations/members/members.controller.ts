import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';

@Controller('organizations/:organizationId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addMember(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      userId: string;
      roleId: string;
      departmentId?: string;
    },
    @Req() req: any,
  ) {
    return this.membersService.addMember(
      organizationId,
      body.userId,
      body.roleId,
      body.departmentId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMembers(
    @Param('organizationId') organizationId: string,
  ) {
    return this.membersService.getMembers(organizationId);
  }
}