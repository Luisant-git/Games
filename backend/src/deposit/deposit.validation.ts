import { BadRequestException } from '@nestjs/common';
import { TransferType, UpiAppName } from './dto/create-deposit.dto';

interface BankTransferDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  transactionId: string;
}

interface UpiTransferDetails {
  upiId: string;
  transactionId: string;
  upiAppName: string;
}

export class DepositValidation {
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