import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService, PrismaService],
  exports: [BankAccountService],
})
export class BankAccountModule {}