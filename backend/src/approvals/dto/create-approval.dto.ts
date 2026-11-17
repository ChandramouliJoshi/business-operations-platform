
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateApprovalDto {
  @IsUUID()
  request_id: string;

  @IsUUID()
  approver_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  comment?: string;
}
