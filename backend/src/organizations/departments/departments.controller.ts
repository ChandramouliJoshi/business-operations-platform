
import {
  Body,
  Delete,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../permissions/permissions.decorator.js';
import { PermissionsGuard } from '../permissions/permissions.guard.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';

@Controller('organizations/:organizationId/departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Post()
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
  @RequirePermission('departments.view')
  async getDepartments(
    @Param('organizationId') organizationId: string,
  ) {
    return this.departmentsService.getDepartments(organizationId);
  }

  @Get(':departmentId')
  @RequirePermission('departments.view')
  getDepartment(@Param('organizationId') organizationId: string, @Param('departmentId') departmentId: string) { return this.departmentsService.getDepartment(organizationId, departmentId); }

  @Patch(':departmentId')
  @RequirePermission('departments.manage')
  updateDepartment(@Param('organizationId') organizationId: string, @Param('departmentId') departmentId: string, @Body() dto: UpdateDepartmentDto) { return this.departmentsService.updateDepartment(organizationId, departmentId, dto); }

  @Delete(':departmentId')
  @RequirePermission('departments.manage')
  deleteDepartment(@Param('organizationId') organizationId: string, @Param('departmentId') departmentId: string) { return this.departmentsService.deleteDepartment(organizationId, departmentId); }
}
