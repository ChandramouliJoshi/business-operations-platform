
import { IsUUID } from 'class-validator';

export class TransitionRequestDto {
  @IsUUID()
  to_state_id: string;
}
