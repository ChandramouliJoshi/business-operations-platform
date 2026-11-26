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
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

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
    @Body() body: CreateProjectDto,
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

  @Get(':projectId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('projects.view')
  getProject(@Param('organizationId') organizationId: string, @Param('projectId') projectId: string) {
    return this.projectsService.getProject(organizationId, projectId);
  }

  @Patch(':projectId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('projects.update')
  updateProject(@Param('organizationId') organizationId: string, @Param('projectId') projectId: string, @Body() body: UpdateProjectDto, @Req() req: any) {
    return this.projectsService.updateProject(organizationId, projectId, req.user.userId, body);
  }

  @Delete(':projectId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('projects.delete')
  deleteProject(@Param('organizationId') organizationId: string, @Param('projectId') projectId: string, @Req() req: any) {
    return this.projectsService.deleteProject(organizationId, projectId, req.user.userId);
  }
}
