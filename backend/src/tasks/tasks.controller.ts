
import {
  Body,
  Controller,
  Delete,
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
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Controller('organizations/:organizationId/projects/:projectId/tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('tasks.create')
  async createTask(
    @Param('organizationId') organizationId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.createTask(
      organizationId,
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
    @Param('organizationId') organizationId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.tasksService.getTasks(
      organizationId,
      projectId,
    );
  }

  @Patch(':taskId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('tasks.update')
  async updateTask(
    @Param('organizationId') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() body: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.updateTask(
      organizationId,
      projectId,
      taskId,
      req.user.userId,
      body.title,
      body.description,
      body.assignedTo,
      body.status,
      body.priority,
      body.deadline,
    );
  }

  @Delete(':taskId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('tasks.delete')
  async deleteTask(
    @Param('organizationId') organizationId: string,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    return this.tasksService.deleteTask(
      organizationId,
      projectId,
      taskId,
      req.user.userId,
    );
  }
}
