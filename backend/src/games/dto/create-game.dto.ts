import { BetType } from '@prisma/client';

export class CreateGameDto {
  betType?: BetType;
  board?: string;
  winningAmount?: number;
  ticket?: number;
  singleDigitMatching?: number;
  doubleDigitMatching?: number;
  tripleDigitMatching?: number;
  isActive?: boolean;
}