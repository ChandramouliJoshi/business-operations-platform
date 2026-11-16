
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWorkflowStateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(0)
  position: number;

  @IsOptional()
  @IsBoolean()
  is_initial?: boolean;

  @IsOptional()
  @IsBoolean()
  is_final?: boolean;
}
