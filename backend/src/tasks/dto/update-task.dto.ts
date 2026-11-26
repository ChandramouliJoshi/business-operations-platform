import { IsDateString, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional() @IsString() @Length(1, 255) title?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string | null;
  @IsOptional() @IsString() assignedTo?: string | null;
  @IsOptional() @IsIn(['todo', 'in_progress', 'blocked', 'done']) status?: string;
  @IsOptional() @IsIn(['low', 'medium', 'high', 'urgent']) priority?: string;
  @IsOptional() @IsDateString() deadline?: string | null;
}
