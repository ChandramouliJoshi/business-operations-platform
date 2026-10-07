import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrganization(
    name: string,
    userId: string,
    email?: string,
    phone?: string,
    website?: string,
    industry?: string,
    size?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the organization
      const organization = await tx.organizations.create({
        data: {
          name,
          email,
          phone,
          website,
          industry,
          size,
        },
      });

      // 2. Create the default Owner role
      const ownerRole = await tx.roles.create({
        data: {
          organization_id: organization.id,
          name: 'Owner',
          description: 'Full access to the organization',
        },
      });

      // 3. Add the creator as an organization member
      await tx.organization_members.create({
        data: {
          organization_id: organization.id,
          user_id: userId,
          role_id: ownerRole.id,
          status: 'active',
        },
      });

      return organization;
    });
  }
}