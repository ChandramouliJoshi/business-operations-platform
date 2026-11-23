
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all active organizations belonging to a user
  async getUserOrganizations(userId: string) {
    const memberships =
      await this.prisma.organization_members.findMany({
        where: {
          user_id: userId,
          status: 'active',
        },
        include: {
          organizations: true,
          roles: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          joined_at: 'asc',
        },
      });

    return memberships.map((membership) => ({
      id: membership.organizations.id,
      name: membership.organizations.name,
      email: membership.organizations.email,
      phone: membership.organizations.phone,
      website: membership.organizations.website,
      industry: membership.organizations.industry,
      size: membership.organizations.size,
      created_at: membership.organizations.created_at,

      membership: {
        id: membership.id,
        status: membership.status,
        joined_at: membership.joined_at,
      },

      role: membership.roles,
    }));
  }

  // Create a new organization
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

      // 3. Retrieve all registered global permissions
      const permissions = await tx.permissions.findMany({
        select: {
          id: true,
        },
      });

      // 4. Assign all permissions to the Owner role
      if (permissions.length > 0) {
        await tx.role_permissions.createMany({
          data: permissions.map((permission) => ({
            role_id: ownerRole.id,
            permission_id: permission.id,
          })),
        });
      }

      // 5. Add the creator as an active organization member
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
