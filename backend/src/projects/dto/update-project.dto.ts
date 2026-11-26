import { IsDateString, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional() @IsString() @Length(1, 255) name?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string | null;
  @IsOptional() @IsString() managerId?: string | null;
  @IsOptional() @IsIn(['planned', 'active', 'on_hold', 'completed', 'archived']) status?: string;
  @IsOptional() @IsDateString() startDate?: string | null;
  @IsOptional() @IsDateString() deadline?: string | null;
}
