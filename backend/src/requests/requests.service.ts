
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // Validate organization membership
  private async validateMembership(
    organizationId: string,
    userId: string,
  ) {
    const membership =
      await this.prisma.organization_members.findFirst({
        where: {
          organization_id: organizationId,
          user_id: userId,
          status: 'active',
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'You are not an active member of this organization',
      );
    }

    return membership;
  }

  // Validate that a request belongs to the organization
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
        workflows: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvals: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  // Create a request
  async createRequest(
    organizationId: string,
    userId: string,
    workflowId: string,
    title: string,
    description?: string,
    data?: Record<string, any>,
  ) {
    await this.validateMembership(organizationId, userId);

    const workflow = await this.prisma.workflows.findFirst({
      where: {
        id: workflowId,
        organization_id: organizationId,
      },
    });

    if (!workflow) {
      throw new NotFoundException(
        'Workflow not found in this organization',
      );
    }

    const initialStates =
      await this.prisma.workflow_states.findMany({
        where: {
          workflow_id: workflowId,
          is_initial: true,
        },
      });

    if (initialStates.length === 0) {
      throw new BadRequestException(
        'This workflow does not have an initial state',
      );
    }

    if (initialStates.length > 1) {
      throw new ConflictException(
        'This workflow has multiple initial states. Please fix its configuration',
      );
    }

    const request = await this.prisma.requests.create({
      data: {
        organization_id: organizationId,
        workflow_id: workflowId,
        created_by: userId,
        current_state_id: initialStates[0].id,
        title,
        description,
        data: data ?? {},
      },
      include: {
        workflow_states: true,
        workflows: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return request;
  }

  // Get all requests belonging to an organization
  async getRequests(organizationId: string) {
    return this.prisma.requests.findMany({
      where: {
        organization_id: organizationId,
      },
      include: {
        workflow_states: true,
        workflows: {
          select: {
            id: true,
            name: true,
            entity_type: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            approvals: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get one request
  async getRequest(
    organizationId: string,
    requestId: string,
  ) {
    return this.validateRequest(
      organizationId,
      requestId,
    );
  }

  // Update request details
  async updateRequest(
    organizationId: string,
    requestId: string,
    data: {
      title?: string;
      description?: string;
      data?: Record<string, any>;
    },
  ) {
    await this.validateRequest(
      organizationId,
      requestId,
    );

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    return this.prisma.requests.update({
      where: {
        id: requestId,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        workflow_states: true,
        workflows: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Move request to another workflow state
  async transitionRequest(
    organizationId: string,
    requestId: string,
    toStateId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.requests.findFirst({
        where: {
          id: requestId,
          organization_id: organizationId,
        },
        include: {
          workflow_states: true,
        },
      });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      if (request.workflow_states.is_final) {
        throw new BadRequestException(
          'This request has already reached its final state',
        );
      }

      if (request.current_state_id === toStateId) {
        throw new BadRequestException(
          'Request is already in this state',
        );
      }

      const targetState =
        await tx.workflow_states.findFirst({
          where: {
            id: toStateId,
            workflow_id: request.workflow_id,
          },
        });

      if (!targetState) {
        throw new NotFoundException(
          'Target state does not belong to this workflow',
        );
      }

      const transition =
        await tx.workflow_transitions.findFirst({
          where: {
            workflow_id: request.workflow_id,
            from_state_id: request.current_state_id,
            to_state_id: toStateId,
          },
        });

      if (!transition) {
        throw new BadRequestException(
          'This transition is not allowed by the workflow',
        );
      }

      // Update only if the request is still in its original state.
      // This prevents concurrent transitions from overwriting each other.
      const result = await tx.requests.updateMany({
        where: {
          id: requestId,
          organization_id: organizationId,
          current_state_id: request.current_state_id,
        },
        data: {
          current_state_id: toStateId,
          updated_at: new Date(),
        },
      });

      if (result.count === 0) {
        throw new ConflictException(
          'Request state changed. Please refresh and try again',
        );
      }

      return tx.requests.findUnique({
        where: {
          id: requestId,
        },
        include: {
          workflow_states: true,
          workflows: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  }
}
