import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../permissions/permissions.decorator.js';
import { PermissionsGuard } from '../permissions/permissions.guard.js';

@Controller('organizations/:organizationId/departments')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('departments.create')
  async createDepartment(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.departmentsService.createDepartment(
      organizationId,
      body.name,
      body.description,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getDepartments(
    @Param('organizationId') organizationId: string,
  ) {
    return this.departmentsService.getDepartments(organizationId);
  }
}