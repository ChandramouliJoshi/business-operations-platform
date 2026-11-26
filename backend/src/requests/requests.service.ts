
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
    if (!workflow.is_active) throw new ConflictException('This workflow is inactive and cannot accept new requests');

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

    // Create request and audit log atomically
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.requests.create({
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

      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          action: 'request.created',
          entity_type: 'request',
          entity_id: request.id,
          metadata: {
            title: request.title,
            workflow_id: workflowId,
            initial_state_id: initialStates[0].id,
          },
        },
      });

      const recipients = await tx.organization_members.findMany({ where: { organization_id: organizationId, status: 'active', user_id: { not: userId } }, select: { user_id: true } });
      if (recipients.length) await tx.notifications.createMany({ data: recipients.map((recipient) => ({ user_id: recipient.user_id, type: 'request.submitted', title: 'New internal request', message: `A new request “${request.title}” was submitted.` })) });

      return request;
    });
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
    const request = await this.validateRequest(
      organizationId,
      requestId,
    );
    const history = await this.prisma.audit_logs.findMany({ where: { organization_id: organizationId, entity_type: 'request', entity_id: requestId }, orderBy: { created_at: 'asc' }, include: { users: { select: { id: true, name: true, email: true } } } });
    return { ...request, history };
  }

  // Update request details
  async updateRequest(
    organizationId: string,
    requestId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      data?: Record<string, any>;
    },
  ) {
    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    // Update request and audit log atomically
    return this.prisma.$transaction(async (tx) => {
      const existingRequest =
        await tx.requests.findFirst({
          where: {
            id: requestId,
            organization_id: organizationId,
          },
        });

      if (!existingRequest) {
        throw new NotFoundException('Request not found');
      }

      if (existingRequest.created_by !== userId) throw new ForbiddenException('Only the requester can edit this request');
      const currentState = await tx.workflow_states.findUnique({ where: { id: existingRequest.current_state_id } });
      if (!currentState || currentState.is_final) throw new ConflictException('This request can no longer be edited in its current state');

      const updatedRequest = await tx.requests.update({
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

      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          action: 'request.updated',
          entity_type: 'request',
          entity_id: requestId,
          metadata: {
            updated_fields: Object.keys(data),
            previous_title: existingRequest.title,
            new_title: updatedRequest.title,
          },
        },
      });

      return updatedRequest;
    });
  }

  // Move request to another workflow state
  async transitionRequest(
    organizationId: string,
    requestId: string,
    userId: string,
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
          workflows: { select: { is_active: true } },
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
      if (!request.workflows.is_active) throw new ConflictException('This workflow is inactive');

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

      if (transition.allowed_role_id) {
        const membership = await tx.organization_members.findFirst({ where: { organization_id: organizationId, user_id: userId, status: 'active' }, select: { role_id: true } });
        if (!membership || membership.role_id !== transition.allowed_role_id) throw new ForbiddenException('Your role cannot perform this transition');
      }

      // Prevent concurrent transitions from overwriting each other
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

      const updatedRequest =
        await tx.requests.findUnique({
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

      // Record the state transition in the audit log
      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          action: 'request.transitioned',
          entity_type: 'request',
          entity_id: requestId,
          metadata: {
            from_state_id: request.current_state_id,
            from_state_name: request.workflow_states.name,
            to_state_id: targetState.id,
            to_state_name: targetState.name,
          },
        },
      });

      const recipients = await tx.organization_members.findMany({ where: { organization_id: organizationId, status: 'active', user_id: { not: request.created_by } }, select: { user_id: true } });
      if (recipients.length) await tx.notifications.createMany({ data: recipients.map((recipient) => ({ user_id: recipient.user_id, type: 'request.updated', title: 'Request status updated', message: `Request “${request.title}” moved to ${targetState.name}.` })) });

      return updatedRequest;
    });
  }

  async cancelRequest(organizationId: string, requestId: string, userId: string) {
    const request = await this.validateRequest(organizationId, requestId);
    if (request.created_by !== userId) throw new ForbiddenException('Only the requester can cancel this request');
    if (request.workflow_states.is_final) throw new ConflictException('This request is already complete');
    const cancelState = await this.prisma.workflow_states.findFirst({ where: { workflow_id: request.workflow_id, is_final: true, name: { contains: 'cancel', mode: 'insensitive' } } });
    if (!cancelState) throw new BadRequestException('This workflow has no final Cancelled state');
    return this.transitionRequest(organizationId, requestId, userId, cancelState.id);
  }
}
