import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { WorkflowsModule } from './workflows/workflows.module.js';
import { WorkflowStatesModule } from './workflow-states/workflow-states.module.js';
import { WorkflowTransitionsModule } from './workflow-transitions/workflow-transitions.module.js';
import { RequestsModule } from './requests/requests.module.js';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    TasksModule,
    WorkflowsModule,
    WorkflowStatesModule,
    WorkflowTransitionsModule,
    RequestsModule,
    ApprovalsModule,
    NotificationsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}