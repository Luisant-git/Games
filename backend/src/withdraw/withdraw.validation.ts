import { BadRequestException } from '@nestjs/common';
import { TransferType, UpiAppName } from './dto/create-withdraw.dto';

export class WithdrawValidation {
  static validateTransferDetails(transferType: TransferType, transferDetails: any): void {
    // No validation - all fields are optional except phone, amount, and screenshot
  }

  private static validateBankTransferDetails(details: any): void {
    // No validation
  }

  private static validateUpiTransferDetails(details: any): void {
    // No validation
  }
}