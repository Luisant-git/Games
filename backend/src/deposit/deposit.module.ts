import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { PrismaService } from '../prisma.service';
import { SettingsService } from '../settings/settings.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [DepositController],
  providers: [DepositService, PrismaService, SettingsService],
  exports: [DepositService],
})
export class DepositModule {}
