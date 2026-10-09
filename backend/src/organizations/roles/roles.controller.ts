import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';

@Controller('organizations/:organizationId/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRole(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.rolesService.createRole(
      organizationId,
      body.name,
      body.description,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRoles(
    @Param('organizationId') organizationId: string,
  ) {
    return this.rolesService.getRoles(organizationId);
  }

  @Post(':roleId/permissions')
  @UseGuards(JwtAuthGuard)
  async assignPermission(
    @Param('roleId') roleId: string,
    @Body()
    body: {
      permissionId: string;
    },
  ) {
    return this.rolesService.assignPermission(
      roleId,
      body.permissionId,
    );
  }
  @Get(':roleId/permissions')
  @UseGuards(JwtAuthGuard)
  async getRolePermissions(
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.getRolePermissions(roleId);
  }
}