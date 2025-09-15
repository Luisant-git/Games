import { IsString, IsNotEmpty, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShowTimeDto {
  @IsString()
  @IsNotEmpty()
  playStart: string;

  @IsString()
  @IsNotEmpty()
  playEnd: string;

  @IsString()
  @IsNotEmpty()
  showTime: string;
}

export class CreateTimingDto {
  @IsInt()
  categoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShowTimeDto)
  showTimes: CreateShowTimeDto[];
}