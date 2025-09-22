import { BadRequestException } from '@nestjs/common';
import { TransferType, UpiAppName } from './dto/create-withdraw.dto';

export class WithdrawValidation {
  static validateTransferDetails(transferType: TransferType, transferDetails: any): void {
    if (transferType === TransferType.BANK_TRANSFER) {
      this.validateBankTransferDetails(transferDetails);
    } else if (transferType === TransferType.UPI_TRANSFER) {
      this.validateUpiTransferDetails(transferDetails);
    }
  }

  private static validateBankTransferDetails(details: any): void {
    const requiredFields = ['accountNumber', 'ifscCode', 'bankName', 'accountHolderName'];
    const missingFields = requiredFields.filter(field => !details[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required bank transfer fields: ${missingFields.join(', ')}`);
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(details.ifscCode)) {
      throw new BadRequestException('Invalid IFSC code format');
    }

    if (!/^\d{9,18}$/.test(details.accountNumber)) {
      throw new BadRequestException('Invalid account number format');
    }
  }

  private static validateUpiTransferDetails(details: any): void {
    const requiredFields = ['upiId', 'upiAppName'];
    const missingFields = requiredFields.filter(field => !details[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required UPI transfer fields: ${missingFields.join(', ')}`);
    }

    if (!Object.values(UpiAppName).includes(details.upiAppName)) {
      throw new BadRequestException('Invalid UPI app name');
    }

    if (!/^[\w.-]+@[\w.-]+$/.test(details.upiId)) {
      throw new BadRequestException('Invalid UPI ID format');
    }
  }
}