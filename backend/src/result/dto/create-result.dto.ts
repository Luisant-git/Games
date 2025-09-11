import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResultDto {
  @ApiProperty({ description: 'Result date' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Time slot (01:00, 06:00, 08:00)' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: '5-digit result numbers' })
  @IsString()
  @IsNotEmpty()
  numbers: string;
}