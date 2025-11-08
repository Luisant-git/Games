import { Module } from '@nestjs/common';
import { OrderReportController } from './order-report.controller';
import { OrderReportService } from './order-report.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [OrderReportController],
  providers: [OrderReportService, PrismaService],
})
export class OrderReportModule {}
