
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class UpdateApprovalDecisionDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsUUID()
  to_state_id?: string;
}
