
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

    try {
      return await this.prisma.workflow_transitions.create({
        data: {
          workflow_id: workflowId,
          from_state_id: dto.from_state_id,
          to_state_id: dto.to_state_id,
          name: dto.name,
        },
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
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    const transition =
      await this.prisma.workflow_transitions.findFirst({
        where: {
          id: transitionId,
          workflow_id: workflowId,
        },
      });

    if (!transition) {
      throw new NotFoundException('Workflow transition not found');
    }

    await this.prisma.workflow_transitions.delete({
      where: {
        id: transitionId,
      },
    });

    return {
      message: 'Workflow transition deleted successfully',
    };
  }
}
