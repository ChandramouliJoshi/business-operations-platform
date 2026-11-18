
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { REQUIRE_PERMISSION_KEY } from './permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const organizationId = request.params.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    const member =
      await this.prisma.organization_members.findFirst({
        where: {
          organization_id: organizationId,
          user_id: user.userId,
          status: 'active',
        },
        select: {
          roles: {
            select: {
              role_permissions: {
                select: {
                  permissions: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!member) {
      throw new ForbiddenException(
        'You are not an active member of this organization',
      );
    }

    const hasPermission =
      member.roles.role_permissions.some(
        (rolePermission) =>
          rolePermission.permissions.name === permission,
      );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
