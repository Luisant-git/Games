import { Controller, Get, Query } from '@nestjs/common';
import { SummaryReportService } from './summary-report.service';
import { SummaryReportFilterDto } from './dto/summary-report-filter.dto';

@Controller('summary-report')
export class SummaryReportController {
  constructor(private readonly summaryReportService: SummaryReportService) {}

  @Get()
  async getSummaryReport(@Query() filterDto: SummaryReportFilterDto) {
    return this.summaryReportService.getSummaryReport(filterDto);
  }
}
