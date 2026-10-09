import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { REQUIRE_PERMISSION_KEY } from './permissions.decorator.js';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const permission = this.reflector.get<string>(
      REQUIRE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      throw new UnauthorizedException();
    }

    const organizationId = request.params.organizationId;

    if (!organizationId) {
      throw new ForbiddenException(
        'Organization ID is required',
      );
    }

    const member =
      await this.prisma.organization_members.findUnique({
        where: {
          organization_id_user_id: {
            organization_id: organizationId,
            user_id: user.userId,
          },
        },
        include: {
          roles: {
            include: {
              role_permissions: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      });

    if (!member) {
      throw new ForbiddenException(
        'You are not a member of this organization',
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