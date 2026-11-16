
import { IsUUID } from 'class-validator';

export class WorkflowIdDto {
  @IsUUID()
  workflowId: string;
}
