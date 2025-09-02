import { ApiProperty } from '@nestjs/swagger';

export enum DepositStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class Deposit {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  playerId: number;

  @ApiProperty({ example: 'UTR123456789' })
  utrNumber: string;

  @ApiProperty({ example: 1000.50 })
  amount: number;

  @ApiProperty({ enum: DepositStatus, example: DepositStatus.PENDING })
  status: DepositStatus;

  @ApiProperty({ example: 123, description: 'Deposit ticket number' })
  ticket?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
