import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsPositive, IsEnum, IsObject } from 'class-validator';
import { TransferType, UpiAppName } from './create-deposit.dto';

export class UpdateDepositDto {
  @ApiPropertyOptional({ enum: TransferType, example: TransferType.UPI_TRANSFER, description: 'Type of transfer' })
  @IsOptional()
  @IsEnum(TransferType)
  transferType?: TransferType;

  @ApiPropertyOptional({ 
    example: { upiId: 'user@paytm', transactionId: 'UPI123456789', upiAppName: 'GOOGLE_PAY' }, 
    description: 'Transfer details based on transfer type' 
  })
  @IsOptional()
  @IsObject()
  transferDetails?: object;

  @ApiPropertyOptional({ example: 1500.75, description: 'Deposit amount' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
