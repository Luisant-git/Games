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
    if (transferType === TransferType.BANK_TRANSFER) {
      this.validateBankTransferDetails(transferDetails);
    } else if (transferType === TransferType.UPI_TRANSFER) {
      this.validateUpiTransferDetails(transferDetails);
    }
  }

  private static validateBankTransferDetails(details: any): void {
    const required = ['accountNumber', 'ifscCode', 'bankName', 'accountHolderName', 'transactionId'];
    
    for (const field of required) {
      if (!details[field] || typeof details[field] !== 'string' || details[field].trim() === '') {
        throw new BadRequestException(`${field} is required for bank transfer`);
      }
    }

    if (!/^[0-9]{9,18}$/.test(details.accountNumber)) {
      throw new BadRequestException('Invalid account number format');
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(details.ifscCode)) {
      throw new BadRequestException('Invalid IFSC code format');
    }
  }

  private static validateUpiTransferDetails(details: any): void {
    const required = ['upiId', 'transactionId', 'upiAppName'];
    
    for (const field of required) {
      if (!details[field] || typeof details[field] !== 'string' || details[field].trim() === '') {
        throw new BadRequestException(`${field} is required for UPI transfer`);
      }
    }

    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(details.upiId)) {
      throw new BadRequestException('Invalid UPI ID format');
    }

    if (!Object.values(UpiAppName).includes(details.upiAppName)) {
      throw new BadRequestException('Invalid UPI app name. Must be GOOGLE_PAY or PHONE_PE');
    }
  }
}