import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStatesController } from './workflow-states.controller.js';

describe('WorkflowStatesController', () => {
  let controller: WorkflowStatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowStatesController],
    }).useMocker(() => ({})).compile();

    controller = module.get<WorkflowStatesController>(WorkflowStatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
