
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkflowTransitionDto } from './dto/create-workflow-transition.dto.js';

@Injectable()
export class WorkflowTransitionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Verify that the workflow belongs to the organization.
  private async validateWorkflow(
    organizationId: string,
    workflowId: string,
  ) {
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

    return workflow;
  }

  // Handle duplicate transition constraints.
  private handleDatabaseError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'This transition already exists between these states',
      );
    }

    throw error;
  }

  // CREATE TRANSITION
  async createTransition(
    organizationId: string,
    workflowId: string,
    userId: string,
    dto: CreateWorkflowTransitionDto,
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    // Prevent a transition from a state to itself.
    if (dto.from_state_id === dto.to_state_id) {
      throw new ConflictException(
        'A state cannot transition to itself',
      );
    }

    // Verify that both states belong to this workflow.
    const states = await this.prisma.workflow_states.findMany({
      where: {
        workflow_id: workflowId,
        id: {
          in: [dto.from_state_id, dto.to_state_id],
        },
      },
    });

    if (states.length !== 2) {
      throw new NotFoundException(
        'One or both states do not belong to this workflow',
      );
    }

    const fromState = states.find(
      (state) => state.id === dto.from_state_id,
    );

    const toState = states.find(
      (state) => state.id === dto.to_state_id,
    );

    if (dto.allowed_role_id) {
      const role = await this.prisma.roles.findFirst({ where: { id: dto.allowed_role_id, organization_id: organizationId }, select: { id: true } });
      if (!role) throw new NotFoundException('Transition role not found in this organization');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const transition = await tx.workflow_transitions.create({
          data: {
            workflow_id: workflowId,
            from_state_id: dto.from_state_id,
            to_state_id: dto.to_state_id,
            name: dto.name,
            allowed_role_id: dto.allowed_role_id,
          },
        });

        // Record the audit event in the same transaction.
        await tx.audit_logs.create({
          data: {
            organization_id: organizationId,
            user_id: userId,
            action: 'workflow_transition.created',
            entity_type: 'workflow_transition',
            entity_id: transition.id,
            metadata: {
              workflow_id: workflowId,
              name: transition.name,
              from_state_id: transition.from_state_id,
              from_state_name: fromState?.name,
              to_state_id: transition.to_state_id,
              to_state_name: toState?.name,
            },
          },
        });

        return transition;
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // GET ALL TRANSITIONS
  async getTransitions(
    organizationId: string,
    workflowId: string,
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    return this.prisma.workflow_transitions.findMany({
      where: {
        workflow_id: workflowId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  // DELETE TRANSITION
  async deleteTransition(
    organizationId: string,
    workflowId: string,
    transitionId: string,
    userId: string,
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    return this.prisma.$transaction(async (tx) => {
      const transition =
        await tx.workflow_transitions.findFirst({
          where: {
            id: transitionId,
            workflow_id: workflowId,
          },
        });

      if (!transition) {
        throw new NotFoundException(
          'Workflow transition not found',
        );
      }

      // Retrieve state names for a more informative audit record.
      const states = await tx.workflow_states.findMany({
        where: {
          id: {
            in: [
              transition.from_state_id,
              transition.to_state_id,
            ],
          },
        },
      });

      const fromState = states.find(
        (state) => state.id === transition.from_state_id,
      );

      const toState = states.find(
        (state) => state.id === transition.to_state_id,
      );

      // Record the audit event before deleting the transition.
      await tx.audit_logs.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          action: 'workflow_transition.deleted',
          entity_type: 'workflow_transition',
          entity_id: transition.id,
          metadata: {
            workflow_id: workflowId,
            name: transition.name,
            from_state_id: transition.from_state_id,
            from_state_name: fromState?.name,
            to_state_id: transition.to_state_id,
            to_state_name: toState?.name,
          },
        },
      });

      await tx.workflow_transitions.delete({
        where: {
          id: transitionId,
        },
      });

      return {
        message: 'Workflow transition deleted successfully',
      };
    });
  }
}
