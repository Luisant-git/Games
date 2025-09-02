import { Module } from '@nestjs/common';
import { TimingService } from './timing.service';
import { TimingController } from './timing.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TimingController],
  providers: [TimingService, PrismaService],
})
export class TimingModule {}