import { Controller, Get, Query } from '@nestjs/common';
import { AgentReportService } from './agent-report.service';
import { AgentReportFilterDto } from './dto/agent-report-filter.dto';

@Controller('agent-report')
export class AgentReportController {
  constructor(private readonly agentReportService: AgentReportService) {}

  @Get()
  async getAgentReport(@Query() filterDto: AgentReportFilterDto) {
    return this.agentReportService.getAgentReport(filterDto);
  }
}
