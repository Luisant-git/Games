import { IsOptional, IsString } from 'class-validator';

export class SummaryReportFilterDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}
