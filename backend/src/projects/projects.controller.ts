import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

@Controller('organizations/:organizationId/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('projects.create')
  async createProject(
    @Param('organizationId') organizationId: string,
    @Body()
    body: {
      name: string;
      description?: string;
      managerId?: string;
      status?: string;
      startDate?: string;
      deadline?: string;
    },
    @Req() req: any,
  ) {
    return this.projectsService.createProject(
      organizationId,
      body.name,
      req.user.userId,
      body.description,
      body.managerId,
      body.status,
      body.startDate,
      body.deadline,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('projects.view')
  async getProjects(
    @Param('organizationId') organizationId: string,
  ) {
    return this.projectsService.getProjects(organizationId);
  }
}