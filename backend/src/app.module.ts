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
import { WithdrawModule } from './withdraw/withdraw.module';
import { GameHistoryModule } from './game-history/game-history.module';

import { CommissionModule } from './commission/commission.module';
import { SupportModule } from './support/support.module';
import { ResultModule } from './result/result.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { OrderReportModule } from './order-report/order-report.module';
import { SummaryReportModule } from './summary-report/summary-report.module';

@Module({
  imports: [AuthModule, GamesModule, AgentModule, PlayerModule, CategoryModule, TimingModule, UploadModule, DepositModule, WithdrawModule, GameHistoryModule, CommissionModule, SupportModule, ResultModule, DashboardModule, SettingsModule, BankAccountModule, OrderReportModule, SummaryReportModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
