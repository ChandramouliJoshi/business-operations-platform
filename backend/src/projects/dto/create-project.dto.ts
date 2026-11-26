import { IsDateString, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString() @Length(1, 255) name!: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsOptional() @IsString() managerId?: string;
  @IsOptional() @IsIn(['planned', 'active', 'on_hold', 'completed', 'archived']) status?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() deadline?: string;
}
