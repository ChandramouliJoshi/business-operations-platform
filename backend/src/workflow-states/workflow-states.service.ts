
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWorkflowStateDto } from './dto/create-workflow-state.dto.js';
import { UpdateWorkflowStateDto } from './dto/update-workflow-state.dto.js';

@Injectable()
export class WorkflowStatesService {
  constructor(private readonly prisma: PrismaService) {}

  // Check whether a workflow belongs to the requested organization.
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
      throw new NotFoundException('Workflow not found in this organization');
    }

    return workflow;
  }

  // Convert Prisma unique constraint errors into readable API errors.
  private handleDatabaseError(error: unknown): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'A state with this name or position already exists in this workflow',
      );
    }

    throw error;
  }

  // CREATE WORKFLOW STATE
  async createState(
    organizationId: string,
    workflowId: string,
    dto: CreateWorkflowStateDto,
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // A workflow can have only one initial state.
        if (dto.is_initial === true) {
          await tx.workflow_states.updateMany({
            where: { workflow_id: workflowId },
            data: { is_initial: false },
          });
        }

        return tx.workflow_states.create({
          data: {
            workflow_id: workflowId,
            name: dto.name,
            position: dto.position,
            is_initial: dto.is_initial ?? false,
            is_final: dto.is_final ?? false,
          },
        });
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // GET ALL STATES FOR A WORKFLOW
  async getStates(organizationId: string, workflowId: string) {
    await this.validateWorkflow(organizationId, workflowId);

    return this.prisma.workflow_states.findMany({
      where: { workflow_id: workflowId },
      orderBy: { position: 'asc' },
    });
  }

  // UPDATE WORKFLOW STATE
  async updateState(
    organizationId: string,
    workflowId: string,
    stateId: string,
    dto: UpdateWorkflowStateDto,
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    const state = await this.prisma.workflow_states.findFirst({
      where: {
        id: stateId,
        workflow_id: workflowId,
      },
    });

    if (!state) {
      throw new NotFoundException('Workflow state not found');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // If this state becomes the initial state,
        // unset the previous initial state first.
        if (dto.is_initial === true) {
          await tx.workflow_states.updateMany({
            where: {
              workflow_id: workflowId,
              id: { not: stateId },
            },
            data: { is_initial: false },
          });
        }

        return tx.workflow_states.update({
          where: { id: stateId },
          data: {
            name: dto.name,
            position: dto.position,
            is_initial: dto.is_initial,
            is_final: dto.is_final,
          },
        });
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  // DELETE WORKFLOW STATE
  async deleteState(
    organizationId: string,
    workflowId: string,
    stateId: string,
  ) {
    await this.validateWorkflow(organizationId, workflowId);

    const state = await this.prisma.workflow_states.findFirst({
      where: {
        id: stateId,
        workflow_id: workflowId,
      },
    });

    if (!state) {
      throw new NotFoundException('Workflow state not found');
    }

    // A state currently used by a request cannot be deleted.
    const existingRequest = await this.prisma.requests.findFirst({
      where: { current_state_id: stateId },
    });

    if (existingRequest) {
      throw new ConflictException(
        'Cannot delete this state because it is being used by a request',
      );
    }

    // A state referenced by a transition cannot be deleted.
    const existingTransition =
      await this.prisma.workflow_transitions.findFirst({
        where: {
          workflow_id: workflowId,
          OR: [
            { from_state_id: stateId },
            { to_state_id: stateId },
          ],
        },
      });

    if (existingTransition) {
      throw new ConflictException(
        'Cannot delete this state because it is used by a workflow transition',
      );
    }

    await this.prisma.workflow_states.delete({
      where: { id: stateId },
    });

    return {
      message: 'Workflow state deleted successfully',
    };
  }
}
