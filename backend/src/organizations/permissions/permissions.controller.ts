import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPermission(
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.permissionsService.createPermission(
      body.name,
      body.description,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPermissions() {
    return this.permissionsService.getPermissions();
  }
}