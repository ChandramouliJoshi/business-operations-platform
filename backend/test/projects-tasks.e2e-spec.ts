
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import { createTestApp } from './helpers/create-test-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Projects and Tasks E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();
  const email = `project-task-${timestamp}@example.com`;
  const password = 'TestPassword@123';

  let userId: string;
  let accessToken: string;
  let organizationId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    const testApplication = await createTestApp();

    app = testApplication.app;
    prisma = testApplication.prisma;

    // Register test user
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Project Task Test User',
        email,
        password,
      })
      .expect(201);

    userId = registration.body.id;

    // Login
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    accessToken = login.body.access_token;

    // Create organization
    const organization = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Project Task Test Organization',
      })
      .expect(201);

    organizationId = organization.body.id;
  });

  afterAll(async () => {
    try {
      if (organizationId) {
        await prisma.$transaction(async (tx) => {
          await tx.audit_logs.deleteMany({
            where: { organization_id: organizationId },
          });

          if (projectId) {
            await tx.tasks.deleteMany({
              where: { project_id: projectId },
            });
          }

          await tx.projects.deleteMany({
            where: { organization_id: organizationId },
          });

          await tx.organization_members.deleteMany({
            where: { organization_id: organizationId },
          });

          await tx.roles.deleteMany({
            where: { organization_id: organizationId },
          });

          await tx.organizations.deleteMany({
            where: { id: organizationId },
          });
        });
      }

      if (userId) {
        await prisma.users.deleteMany({
          where: { id: userId },
        });
      }
    } finally {
      if (app) {
        await app.close();
      }
    }
  });

  describe('Projects', () => {
    it('should create a project and record an audit log', async () => {
      const response = await request(app.getHttpServer())
        .post(`/organizations/${organizationId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'E2E Test Project',
          description: 'Project created during integration testing',
          status: 'active',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E2E Test Project');
      expect(response.body.organization_id).toBe(organizationId);
      expect(response.body.created_by).toBe(userId);

      projectId = response.body.id;

      const auditLog = await prisma.audit_logs.findFirst({
        where: {
          organization_id: organizationId,
          entity_id: projectId,
          action: 'project.created',
        },
      });

      expect(auditLog).not.toBeNull();
    });

    it('should retrieve projects belonging to the organization', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${organizationId}/projects`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.some(
          (project: { id: string }) => project.id === projectId,
        ),
      ).toBe(true);
    });

    it('should reject project creation without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/organizations/${organizationId}/projects`)
        .send({ name: 'Unauthorized Project' })
        .expect(401);
    });
  });

  describe('Tasks', () => {
    it('should create a task and retrieve it from the project', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/organizations/${organizationId}/projects/${projectId}/tasks`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'E2E Test Task',
          description: 'Task created during integration testing',
          assignedTo: userId,
          priority: 'high',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('E2E Test Task');
      expect(response.body.project_id).toBe(projectId);
      expect(response.body.created_by).toBe(userId);
      expect(response.body.assigned_to).toBe(userId);
      expect(response.body.status).toBe('todo');
      expect(response.body.priority).toBe('high');

      taskId = response.body.id;

      const auditLog = await prisma.audit_logs.findFirst({
        where: {
          organization_id: organizationId,
          entity_id: taskId,
          action: 'task.created',
        },
      });

      expect(auditLog).not.toBeNull();

      const taskList = await request(app.getHttpServer())
        .get(
          `/organizations/${organizationId}/projects/${projectId}/tasks`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(
        taskList.body.some(
          (task: { id: string }) => task.id === taskId,
        ),
      ).toBe(true);
    });

    it('should update a task and record an audit log', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated E2E Test Task',
          status: 'in_progress',
          priority: 'high',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated E2E Test Task');
      expect(response.body.status).toBe('in_progress');

      const auditLog = await prisma.audit_logs.findFirst({
        where: {
          organization_id: organizationId,
          entity_id: taskId,
          action: 'task.updated',
        },
      });

      expect(auditLog).not.toBeNull();
    });

    it('should delete a task and record its deletion', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe(
        'Task deleted successfully',
      );

      const deletedTask = await prisma.tasks.findUnique({
        where: { id: taskId },
      });

      expect(deletedTask).toBeNull();

      const auditLog = await prisma.audit_logs.findFirst({
        where: {
          organization_id: organizationId,
          entity_id: taskId,
          action: 'task.deleted',
        },
      });

      expect(auditLog).not.toBeNull();
    });
  });
});
