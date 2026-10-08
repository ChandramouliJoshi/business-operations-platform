import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';
import { MembersController } from './members/members.controller.js';
import { MembersService } from './members/members.service.js';
import { DepartmentsController } from './departments/departments.controller.js';
import { DepartmentsService } from './departments/departments.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    OrganizationsController,
    MembersController,
    DepartmentsController,
  ],
  providers: [
    OrganizationsService,
    MembersService,
    DepartmentsService,
  ],
})
export class OrganizationsModule {}