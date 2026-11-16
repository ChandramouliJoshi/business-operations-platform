
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a workflow
  async createWorkflow(
    organizationId: string,
    createdBy: string,
    name: string,
    entityType: string,
    description?: string,
  ) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const member = await this.prisma.organization_members.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: organizationId,
          user_id: createdBy,
        },
      },
    });

    if (!member) {
      throw new ConflictException(
        'User is not a member of this organization',
      );
    }

    const existingWorkflow = await this.prisma.workflows.findFirst({
      where: {
        organization_id: organizationId,
        name,
      },
    });

    if (existingWorkflow) {
      throw new ConflictException(
        'A workflow with this name already exists',
      );
    }

    return this.prisma.workflows.create({
      data: {
        organization_id: organizationId,
        created_by: createdBy,
        name,
        entity_type: entityType,
        description,
      },
    });
  }

  // Get all workflows belonging to an organization
  async getWorkflows(organizationId: string) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.workflows.findMany({
      where: {
        organization_id: organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get one workflow with its states and transitions
  async getWorkflow(
    organizationId: string,
    workflowId: string,
  ) {
    const workflow = await this.prisma.workflows.findFirst({
      where: {
        id: workflowId,
        organization_id: organizationId,
      },
      include: {
        workflow_states: {
          orderBy: {
            position: 'asc',
          },
        },
        workflow_transitions: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException(
        'Workflow not found in this organization',
      );
    }

    return workflow;
  }

  // Update a workflow
  async updateWorkflow(
    organizationId: string,
    workflowId: string,
    name?: string,
    description?: string,
    entityType?: string,
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

    if (name && name !== workflow.name) {
      const existingWorkflow =
        await this.prisma.workflows.findFirst({
          where: {
            organization_id: organizationId,
            name,
            NOT: {
              id: workflowId,
            },
          },
        });

      if (existingWorkflow) {
        throw new ConflictException(
          'A workflow with this name already exists',
        );
      }
    }

    return this.prisma.workflows.update({
      where: { id: workflowId },
      data: {
        name,
        description,
        entity_type: entityType,
      },
    });
  }

  // Delete a workflow
  async deleteWorkflow(
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

    // Do not delete workflows that already have requests
    const existingRequests = await this.prisma.requests.findFirst({
      where: {
        workflow_id: workflowId,
      },
    });

    if (existingRequests) {
      throw new ConflictException(
        'Cannot delete a workflow that has existing requests',
      );
    }

    await this.prisma.workflows.delete({
      where: { id: workflowId },
    });

    return {
      message: 'Workflow deleted successfully',
    };
  }
}
