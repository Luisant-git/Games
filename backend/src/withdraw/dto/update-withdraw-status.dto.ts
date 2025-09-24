import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export enum WithdrawStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'MISMATCH',
}

export class UpdateWithdrawStatusDto {
  @ApiProperty({ enum: WithdrawStatus, example: WithdrawStatus.COMPLETED, description: 'Withdraw status' })
  @IsEnum(WithdrawStatus)
  @IsNotEmpty()
  status: WithdrawStatus;

  @ApiPropertyOptional({ example: 123, description: 'Withdraw ticket number' })
  @IsOptional()
  @IsNumber()
  ticket?: number;
}