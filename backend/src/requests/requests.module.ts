
import { Module } from '@nestjs/common';

import { RequestsController } from './requests.controller.js';
import { RequestsService } from './requests.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { PermissionsGuard } from '../organizations/permissions/permissions.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [RequestsController],
  providers: [RequestsService, PermissionsGuard],
})
export class RequestsModule {}
