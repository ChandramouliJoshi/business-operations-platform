
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApprovalDto } from './dto/create-approval.dto.js';
import { UpdateApprovalDecisionDto } from './dto/update-approval-decision.dto.js';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  // Validate that a request belongs to the organization.
  private async validateRequest(
    organizationId: string,
    requestId: string,
  ) {
    const request = await this.prisma.requests.findFirst({
      where: {
        id: requestId,
        organization_id: organizationId,
      },
      include: {
        workflow_states: true,
      },
    });

    if (!request) {
      throw new NotFoundException(
        'Request not found in this organization',
      );
    }

    return request;
  }

  // Validate that a user belongs to the organization.
  private async validateMembership(
    organizationId: string,
    userId: string,
  ) {
    const membership =
      await this.prisma.organization_members.findUnique({
        where: {
          organization_id_user_id: {
            organization_id: organizationId,
            user_id: userId,
          },
        },
      });

    if (!membership) {
      throw new BadRequestException(
        'The assigned approver is not a member of this organization',
      );
    }

    return membership;
  }

  // Create an approval assignment.
  async createApproval(
    organizationId: string,
    dto: CreateApprovalDto,
  ) {
    const request = await this.validateRequest(
      organizationId,
      dto.request_id,
    );

    // Do not assign approvals to completed requests.
    if (request.workflow_states.is_final) {
      throw new BadRequestException(
        'Cannot assign an approval to a request that has reached its final state',
      );
    }

    // Ensure the assigned approver belongs to this organization.
    await this.validateMembership(
      organizationId,
      dto.approver_id,
    );

    // Prevent duplicate pending approvals for the same user.
    const existingApproval =
      await this.prisma.approvals.findFirst({
        where: {
          request_id: dto.request_id,
          approver_id: dto.approver_id,
          status: 'pending',
        },
      });

    if (existingApproval) {
      throw new ConflictException(
        'A pending approval already exists for this user and request',
      );
    }

    return this.prisma.approvals.create({
      data: {
        request_id: dto.request_id,
        approver_id: dto.approver_id,
        status: 'pending',
        comment: dto.comment,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        requests: {
          select: {
            id: true,
            title: true,
            organization_id: true,
            current_state_id: true,
          },
        },
      },
    });
  }

  // Get all approvals belonging to an organization.
  async getApprovals(organizationId: string) {
    return this.prisma.approvals.findMany({
      where: {
        requests: {
          is: {
            organization_id: organizationId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        requests: {
          select: {
            id: true,
            title: true,
            current_state_id: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get approvals for a particular request.
  async getRequestApprovals(
    organizationId: string,
    requestId: string,
  ) {
    await this.validateRequest(organizationId, requestId);

    return this.prisma.approvals.findMany({
      where: {
        request_id: requestId,
        requests: {
          is: {
            organization_id: organizationId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Approve or reject an assigned approval.
  async decideApproval(
    organizationId: string,
    approvalId: string,
    userId: string,
    dto: UpdateApprovalDecisionDto,
  ) {
    const approval = await this.prisma.approvals.findFirst({
      where: {
        id: approvalId,
        requests: {
          is: {
            organization_id: organizationId,
          },
        },
      },
      include: {
        requests: {
          select: {
            id: true,
            organization_id: true,
            current_state_id: true,
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException(
        'Approval not found in this organization',
      );
    }

    // Only the assigned approver can make the decision.
    if (approval.approver_id !== userId) {
      throw new ForbiddenException(
        'Only the assigned approver can decide this approval',
      );
    }

    // An approval can only be decided once.
    if (approval.status !== 'pending') {
      throw new ConflictException(
        'This approval has already been decided',
      );
    }

    return this.prisma.approvals.update({
      where: {
        id: approvalId,
      },
      data: {
        status: dto.status,
        comment: dto.comment,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        requests: {
          select: {
            id: true,
            title: true,
            organization_id: true,
          },
        },
      },
    });
  }
}
