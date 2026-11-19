
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

describe('Organizations E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = `org-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword@123';
  const testName = 'Organization Test User';

  let userId: string;
  let accessToken: string;
  let organizationId: string;

  beforeAll(async () => {
    const testApplication = await createTestApp();

    app = testApplication.app;
    prisma = testApplication.prisma;

    // Create a dedicated user for this test suite.
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    userId = registration.body.id;

    // Authenticate the test user.
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    accessToken = login.body.access_token;
  });

  // Safely remove an organization and its dependent records.
  async function cleanupOrganization(id: string) {
    await prisma.$transaction(async (tx) => {
      await tx.organization_members.deleteMany({
        where: { organization_id: id },
      });

      await tx.roles.deleteMany({
        where: { organization_id: id },
      });

      await tx.organizations.deleteMany({
        where: { id },
      });
    });
  }

  afterAll(async () => {
    try {
      if (organizationId) {
        await cleanupOrganization(organizationId);
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

  describe('POST /organizations', () => {
    it('should reject organization creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/organizations')
        .send({
          name: 'Unauthorized Organization',
        })
        .expect(401);
    });

    it('should create an organization for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Integration Test Organization',
          email: 'org@example.com',
          phone: '+911234567890',
          website: 'https://example.com',
          industry: 'Technology',
          size: '11-50',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Integration Test Organization');
      expect(response.body.email).toBe('org@example.com');
      expect(response.body.phone).toBe('+911234567890');
      expect(response.body.website).toBe('https://example.com');
      expect(response.body.industry).toBe('Technology');
      expect(response.body.size).toBe('11-50');

      organizationId = response.body.id;
    });

    it('should persist the organization in the database', async () => {
      const organization = await prisma.organizations.findUnique({
        where: { id: organizationId },
      });

      expect(organization).not.toBeNull();
      expect(organization?.name).toBe('Integration Test Organization');
    });

    it('should automatically assign the creator as an active member', async () => {
      const membership = await prisma.organization_members.findUnique({
        where: {
          organization_id_user_id: {
            organization_id: organizationId,
            user_id: userId,
          },
        },
      });

      expect(membership).not.toBeNull();
      expect(membership?.status).toBe('active');
      expect(membership?.user_id).toBe(userId);
    });

    it('should create an Owner role for the organization', async () => {
      const ownerRole = await prisma.roles.findFirst({
        where: {
          organization_id: organizationId,
          name: 'Owner',
        },
      });

      expect(ownerRole).not.toBeNull();

      const membership = await prisma.organization_members.findUnique({
        where: {
          organization_id_user_id: {
            organization_id: organizationId,
            user_id: userId,
          },
        },
      });

      expect(membership?.role_id).toBe(ownerRole?.id);
    });

    it('should assign all registered permissions to the Owner role', async () => {
      const ownerRole = await prisma.roles.findFirst({
        where: {
          organization_id: organizationId,
          name: 'Owner',
        },
      });

      expect(ownerRole).not.toBeNull();

      const [allPermissions, assignedPermissions] = await Promise.all([
        prisma.permissions.findMany({
          select: { id: true },
        }),
        prisma.role_permissions.findMany({
          where: { role_id: ownerRole!.id },
          select: { permission_id: true },
        }),
      ]);

      expect(assignedPermissions).toHaveLength(allPermissions.length);

      const assignedIds = new Set(
        assignedPermissions.map((permission) => permission.permission_id),
      );

      for (const permission of allPermissions) {
        expect(assignedIds.has(permission.id)).toBe(true);
      }
    });

    it('should use the authenticated user instead of a supplied userId', async () => {
      const response = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Creator Verification Organization',
          userId: '00000000-0000-0000-0000-000000000001',
        })
        .expect(201);

      const createdOrganizationId = response.body.id;

      try {
        const membership = await prisma.organization_members.findUnique({
          where: {
            organization_id_user_id: {
              organization_id: createdOrganizationId,
              user_id: userId,
            },
          },
        });

        expect(membership).not.toBeNull();
        expect(membership?.status).toBe('active');
      } finally {
        await cleanupOrganization(createdOrganizationId);
      }
    });
  });
});
