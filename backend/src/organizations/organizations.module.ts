import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';
import { MembersController } from './members/members.controller.js';
import { MembersService } from './members/members.service.js';
import { DepartmentsController } from './departments/departments.controller.js';
import { DepartmentsService } from './departments/departments.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RolesController } from './roles/roles.controller.js';
import { RolesService } from './roles/roles.service.js';
import { PermissionsController } from './permissions/permissions.controller.js';
import { PermissionsService } from './permissions/permissions.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    OrganizationsController,
    MembersController,
    DepartmentsController,
    RolesController,
    PermissionsController,
  ],
  providers: [
    OrganizationsService,
    MembersService,
    DepartmentsService,
    RolesService,
    PermissionsService,
  ],
})
export class OrganizationsModule {}