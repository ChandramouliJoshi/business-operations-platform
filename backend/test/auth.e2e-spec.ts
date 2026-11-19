
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

describe('Authentication E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = `auth-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword@123';
  const testName = 'Authentication Test User';

  let registeredUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    const testApplication = await createTestApp();

    app = testApplication.app;
    prisma = testApplication.prisma;
  });

  afterAll(async () => {
    // Delete only the user created by this test suite.
    if (registeredUserId) {
      await prisma.users.deleteMany({
        where: { id: registeredUserId },
      });
    }

    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: testName,
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testName);
      expect(response.body.email).toBe(testEmail);
      expect(response.body).not.toHaveProperty('password_hash');

      registeredUserId = response.body.id;

      const storedUser = await prisma.users.findUnique({
        where: { id: registeredUserId },
      });

      expect(storedUser).not.toBeNull();
      expect(storedUser?.password_hash).not.toBe(testPassword);
    });

    it('should reject registration with an existing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: testName,
          email: testEmail,
          password: testPassword,
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should log in with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');

      accessToken = response.body.access_token;
    });

    it('should reject an incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword@123',
        })
        .expect(401);
    });

    it('should reject an unknown email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unknown-auth-user@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should reject requests without a JWT', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject an invalid JWT', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return the authenticated user with a valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.userId).toBe(registeredUserId);
      expect(response.body.email).toBe(testEmail);
    });
  });
});
