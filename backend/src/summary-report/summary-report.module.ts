import { Module } from '@nestjs/common';
import { SummaryReportController } from './summary-report.controller';
import { SummaryReportService } from './summary-report.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SummaryReportController],
  providers: [SummaryReportService, PrismaService],
})
export class SummaryReportModule {}
