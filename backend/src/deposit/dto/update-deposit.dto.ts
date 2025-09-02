import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';

export class UpdateDepositDto {
  @ApiPropertyOptional({ example: 'UTR987654321', description: 'UTR Number for the deposit' })
  @IsOptional()
  @IsString()
  utrNumber?: string;

  @ApiPropertyOptional({ example: 1500.75, description: 'Deposit amount' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
