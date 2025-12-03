import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderReportFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  showtimeId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  board?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  qty?: number;

  @IsOptional()
  @IsString()
  betNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}
