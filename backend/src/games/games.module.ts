import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma.service';
import { CommissionService } from '../commission/commission.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, PrismaService, CommissionService],
})
export class GamesModule {}