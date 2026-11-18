
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard.js';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  async getPermissions() {
    return this.permissionsService.getPermissions();
  }
}
