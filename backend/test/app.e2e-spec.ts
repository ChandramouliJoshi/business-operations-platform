
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/create-test-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Application E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApplication = await createTestApp();

    app = testApplication.app;
    prisma = testApplication.prisma;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET / should return the application welcome message', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should connect to the dedicated test database', async () => {
    const result = await prisma.$queryRaw<
      Array<{ database_name: string }>
    >`SELECT current_database() AS database_name`;

    expect(result).toHaveLength(1);
    expect(result[0].database_name).toBe('nexora_e2e_test');
  });
});
