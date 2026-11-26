import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStatesService } from './workflow-states.service.js';

describe('WorkflowStatesService', () => {
  let service: WorkflowStatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowStatesService],
    }).useMocker(() => ({})).compile();

    service = module.get<WorkflowStatesService>(WorkflowStatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
