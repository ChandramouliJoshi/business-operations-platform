
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWorkflowTransitionDto {
  @IsUUID()
  from_state_id: string;

  @IsUUID()
  to_state_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
