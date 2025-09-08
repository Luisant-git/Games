import { Module } from '@nestjs/common';
import { GameHistoryController } from './game-history.controller';
import { GameHistoryService } from './game-history.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GameHistoryController],
  providers: [GameHistoryService, PrismaService],
})
export class GameHistoryModule {}