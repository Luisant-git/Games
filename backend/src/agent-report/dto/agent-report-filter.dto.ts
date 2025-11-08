import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AgentReportFilterDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  showtimeId?: number;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}
