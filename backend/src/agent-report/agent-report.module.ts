import { Module } from '@nestjs/common';
import { AgentReportController } from './agent-report.controller';
import { AgentReportService } from './agent-report.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AgentReportController],
  providers: [AgentReportService, PrismaService],
})
export class AgentReportModule {}
