import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPositive, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum TransferType {
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI_TRANSFER = 'UPI_TRANSFER',
}

export enum UpiAppName {
  GOOGLE_PAY = 'GOOGLE_PAY',
  PHONE_PE = 'PHONE_PE',
}

export class CreateDepositDto {
  @ApiProperty({ enum: TransferType, example: TransferType.BANK_TRANSFER, description: 'Type of transfer' })
  @IsEnum(TransferType)
  @IsNotEmpty()
  transferType: TransferType;

  @ApiProperty({ 
    example: { accountNumber: '1234567890', ifscCode: 'SBIN0001234', bankName: 'State Bank of India', accountHolderName: 'John Doe', transactionId: 'TXN123456789' }, 
    description: 'Transfer details based on transfer type. For UPI: { upiId: "user@paytm", transactionId: "UPI123456789", upiAppName: "GOOGLE_PAY" }' 
  })
  @IsObject()
  @IsNotEmpty()
  transferDetails: object;

  @ApiProperty({ example: 1000.50, description: 'Deposit amount' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 123, description: 'Deposit ticket number', required: false })
  @IsNumber()
  @IsOptional()
  ticket?: number;
}
