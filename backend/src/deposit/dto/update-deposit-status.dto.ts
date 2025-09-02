import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { DepositStatus } from '../entities/deposit.entity';

export class UpdateDepositStatusDto {
  @ApiProperty({ enum: DepositStatus, example: DepositStatus.COMPLETED })
  @IsEnum(DepositStatus)
  status: DepositStatus;

  @ApiProperty({ example: 123, description: 'Deposit ticket number', required: false })
  @IsNumber()
  @IsOptional()
  ticket?: number;
}