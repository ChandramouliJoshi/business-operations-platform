
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

describe('Members E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const timestamp = Date.now();

  const ownerEmail = `members-owner-${timestamp}@example.com`;
  const memberEmail = `members-user-${timestamp}@example.com`;

  const password = 'TestPassword@123';

  let ownerId: string;
  let memberId: string;
  let organizationId: string;

  let ownerToken: string;
  let ownerRoleId: string;
  let memberRoleId: string;

  beforeAll(async () => {
    const testApplication = await createTestApp();

    app = testApplication.app;
    prisma = testApplication.prisma;

    // Register organization owner.
    const ownerRegistration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Members Test Owner',
        email: ownerEmail,
        password,
      })
      .expect(201);

    ownerId = ownerRegistration.body.id;

    // Authenticate owner.
    const ownerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: ownerEmail,
        password,
      })
      .expect(201);

    ownerToken = ownerLogin.body.access_token;

    // Create organization.
    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Members Integration Test Organization',
      })
      .expect(201);

    organizationId = organizationResponse.body.id;

    // Retrieve automatically created Owner role.
    const ownerRole = await prisma.roles.findFirst({
      where: {
        organization_id: organizationId,
        name: 'Owner',
      },
    });

    if (!ownerRole) {
      throw new Error('Owner role was not created.');
    }

    ownerRoleId = ownerRole.id;

    // Create a regular Member role.
    const memberRole = await prisma.roles.create({
      data: {
        organization_id: organizationId,
        name: 'Member',
        description: 'Standard organization member',
      },
    });

    memberRoleId = memberRole.id;

    // Register another user to add to the organization.
    const memberRegistration = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Members Test User',
        email: memberEmail,
        password,
      })
      .expect(201);

    memberId = memberRegistration.body.id;
  });

  // Clean up test data.
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

      if (ownerId || memberId) {
        await prisma.users.deleteMany({
          where: {
            id: {
              in: [ownerId, memberId].filter(Boolean),
            },
          },
        });
      }
    } finally {
      if (app) {
        await app.close();
      }
    }
  });

  describe('POST /organizations/:organizationId/members', () => {
    it('should add an authenticated user as an organization member', async () => {
      const response = await request(app.getHttpServer())
        .post(`/organizations/${organizationId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          userId: memberId,
          roleId: memberRoleId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.organization_id).toBe(organizationId);
      expect(response.body.user_id).toBe(memberId);
      expect(response.body.role_id).toBe(memberRoleId);
      expect(response.body.status).toBe('active');

      expect(response.body.users.email).toBe(memberEmail);
      expect(response.body.users).not.toHaveProperty('password_hash');
    });

    it('should reject adding an existing organization member', async () => {
      await request(app.getHttpServer())
        .post(`/organizations/${organizationId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          userId: memberId,
          roleId: memberRoleId,
        })
        .expect(409);
    });

    it('should prevent assigning the Owner role through member creation', async () => {
      const response = await request(app.getHttpServer())
        .post(`/organizations/${organizationId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          userId: memberId,
          roleId: ownerRoleId,
        })
        .expect(403);

      expect(response.body.message).toBe(
        'The Owner role cannot be assigned through member creation',
      );
    });

    it('should reject adding a member without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/organizations/${organizationId}/members`)
        .send({
          userId: memberId,
          roleId: memberRoleId,
        })
        .expect(401);
    });
  });

  describe('GET /organizations/:organizationId/members', () => {
    it('should return organization members without exposing sensitive user data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${organizationId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      const addedMember = response.body.find(
        (member: { user_id: string }) => member.user_id === memberId,
      );

      expect(addedMember).toBeDefined();
      expect(addedMember.status).toBe('active');
      expect(addedMember.users.email).toBe(memberEmail);

      expect(addedMember.users).not.toHaveProperty('password_hash');
    });
  });
});
