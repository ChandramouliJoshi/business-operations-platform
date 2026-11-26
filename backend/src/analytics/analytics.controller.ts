import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';
import { RequirePermission } from '../organizations/permissions/permissions.decorator.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('organizations/:organizationId/analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @RequirePermission('projects.view')
  getDashboard(@Param('organizationId') organizationId: string, @Req() req: any) {
    return this.analyticsService.getDashboard(organizationId, req.user.userId);
  }
}
