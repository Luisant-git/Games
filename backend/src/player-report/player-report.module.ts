import { Module } from '@nestjs/common';
import { PlayerReportController } from './player-report.controller';
import { PlayerReportService } from './player-report.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PlayerReportController],
  providers: [PlayerReportService, PrismaService],
})
export class PlayerReportModule {}
