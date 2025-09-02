import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPositive, IsNumber, IsOptional } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ example: 'UTR123456789', description: 'UTR Number for the deposit' })
  @IsString()
  @IsNotEmpty()
  utrNumber: string;

  @ApiProperty({ example: 1000.50, description: 'Deposit amount' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 123, description: 'Deposit ticket number', required: false })
  @IsNumber()
  @IsOptional()
  ticket?: number;
}
