import { IsString, IsNotEmpty, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShowTimeDto {
  @IsNotEmpty()
  playStart: Date;

  @IsNotEmpty()
  playEnd: Date;

  @IsNotEmpty()
  showTime: Date;
}

export class CreateTimingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  categoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShowTimeDto)
  showTimes: CreateShowTimeDto[];
}