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
import { TasksService } from './tasks.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

@Controller('organizations/:organizationId/projects/:projectId/tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('tasks.create')
  async createTask(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      title: string;
      description?: string;
      assignedTo?: string;
      status?: string;
      priority?: string;
      deadline?: string;
    },
    @Req() req: any,
  ) {
    return this.tasksService.createTask(
      projectId,
      req.user.userId,
      body.title,
      body.description,
      body.assignedTo,
      body.status,
      body.priority,
      body.deadline,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('tasks.view')
  async getTasks(
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.getTasks(projectId);
  }

  @Patch(':taskId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('tasks.update')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      assignedTo?: string;
      status?: string;
      priority?: string;
      deadline?: string;
    },
  ) {
    return this.tasksService.updateTask(
      taskId,
      body.title,
      body.description,
      body.assignedTo,
      body.status,
      body.priority,
      body.deadline,
    );
  }
}