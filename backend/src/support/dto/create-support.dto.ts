import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupportDto {
  @ApiProperty({ description: 'Subject of the support ticket' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Image attachment', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}