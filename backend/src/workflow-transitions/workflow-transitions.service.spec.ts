import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowTransitionsService } from './workflow-transitions.service.js';

describe('WorkflowTransitionsService', () => {
  let service: WorkflowTransitionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowTransitionsService],
    }).compile();

    service = module.get<WorkflowTransitionsService>(WorkflowTransitionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
