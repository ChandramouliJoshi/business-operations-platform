
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationsService } from './organizations.service.js';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  // Get all organizations the logged-in user belongs to
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserOrganizations(@Req() req: any) {
    return this.organizationsService.getUserOrganizations(
      req.user.userId,
    );
  }

  // Create a new organization
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrganization(
    @Body()
    body: {
      name: string;
      email?: string;
      phone?: string;
      website?: string;
      industry?: string;
      size?: string;
    },
    @Req() req: any,
  ) {
    return this.organizationsService.createOrganization(
      body.name,
      req.user.userId,
      body.email,
      body.phone,
      body.website,
      body.industry,
      body.size,
    );
  }
}
