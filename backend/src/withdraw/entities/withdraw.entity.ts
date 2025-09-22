import { ApiProperty } from '@nestjs/swagger';

export enum TransferType {
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI_TRANSFER = 'UPI_TRANSFER',
}

export enum UpiAppName {
  GOOGLE_PAY = 'GOOGLE_PAY',
  PHONE_PE = 'PHONE_PE',
}

export enum WithdrawStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class Withdraw {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  playerId: number;

  @ApiProperty({ enum: TransferType, example: TransferType.BANK_TRANSFER })
  transferType: TransferType;

  @ApiProperty({ example: { accountNumber: '1234567890', ifscCode: 'SBIN0001234', bankName: 'State Bank of India', accountHolderName: 'John Doe', transactionId: 'TXN123456789' } })
  transferDetails: object;

  @ApiProperty({ example: 1000.50 })
  amount: number;

  @ApiProperty({ enum: WithdrawStatus, example: WithdrawStatus.PENDING })
  status: WithdrawStatus;

  @ApiProperty({ example: 123, description: 'Withdraw ticket number' })
  ticket?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}