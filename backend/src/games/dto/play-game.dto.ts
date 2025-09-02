import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, Min, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GamePlayDto {
  @IsNotEmpty()
  @IsNumber()
  gameId: number;

  @IsNotEmpty()
  @IsString()
  board: string;

  @IsNotEmpty()
  @IsString()
  betType: string;

  @IsNotEmpty()
  numbers: any; // Can be number or array

  @IsNotEmpty()
  @IsNumber()
  qty: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  winAmount: number;
}

export class PlayGameDto {
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  showtimeId: number;

  @IsNotEmpty()
  @IsDateString()
  showTime: string;

  @IsNotEmpty()
  @IsDateString()
  playStart: string;

  @IsNotEmpty()
  @IsDateString()
  playEnd: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GamePlayDto)
  gameplay: GamePlayDto[];
}