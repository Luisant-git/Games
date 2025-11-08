import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayerReportFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  showtimeId?: number;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}
