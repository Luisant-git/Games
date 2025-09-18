import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { AgentModule } from './agent/agent.module';
import { PlayerModule } from './player/player.module';
import { CategoryModule } from './category/category.module';
import { TimingModule } from './timing/timing.module';
import { UploadModule } from './upload/upload.module';
import { DepositModule } from './deposit/deposit.module';
import { GameHistoryModule } from './game-history/game-history.module';

import { CommissionModule } from './commission/commission.module';
import { SupportModule } from './support/support.module';
import { ResultModule } from './result/result.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, GamesModule, AgentModule, PlayerModule, CategoryModule, TimingModule, UploadModule, DepositModule, GameHistoryModule, CommissionModule, SupportModule, ResultModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
