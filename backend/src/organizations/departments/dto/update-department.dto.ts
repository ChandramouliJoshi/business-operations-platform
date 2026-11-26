import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional() @IsString() @Length(1, 100) name?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string | null;
}
