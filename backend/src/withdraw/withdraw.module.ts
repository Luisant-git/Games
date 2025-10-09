import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { PrismaService } from '../prisma.service';
import { SettingsService } from '../settings/settings.service';

@Module({
  controllers: [WithdrawController],
  providers: [WithdrawService, PrismaService, SettingsService],
  exports: [WithdrawService],
})
export class WithdrawModule {}