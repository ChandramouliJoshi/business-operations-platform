
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
import { PermissionsGuard } from '../permissions/permissions.guard.js';
import { RequirePermission } from '../permissions/permissions.decorator.js';

@Controller('organizations/:organizationId/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  @RequirePermission('roles.create')
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
  @RequirePermission('roles.view')
  async getRoles(
    @Param('organizationId') organizationId: string,
  ) {
    return this.rolesService.getRoles(organizationId);
  }

  @Post(':roleId/permissions')
  @RequirePermission('roles.permissions.assign')
  async assignPermission(
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
    @Body()
    body: {
      permissionId: string;
    },
  ) {
    return this.rolesService.assignPermission(
      organizationId,
      roleId,
      body.permissionId,
    );
  }

  @Get(':roleId/permissions')
  @RequirePermission('roles.permissions.view')
  async getRolePermissions(
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.getRolePermissions(
      organizationId,
      roleId,
    );
  }
}
