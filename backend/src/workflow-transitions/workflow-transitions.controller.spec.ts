import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowTransitionsController } from './workflow-transitions.controller.js';

describe('WorkflowTransitionsController', () => {
  let controller: WorkflowTransitionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowTransitionsController],
    }).useMocker(() => ({})).compile();

    controller = module.get<WorkflowTransitionsController>(WorkflowTransitionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
