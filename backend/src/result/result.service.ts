import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateResultDto } from './dto/create-result.dto';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  async create(createResultDto: CreateResultDto) {
    return this.prisma.result.create({
      data: {
        ...createResultDto,
        date: new Date(createResultDto.date)
      }
    });
  }

  async findAll() {
    const results = await this.prisma.result.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return results.map(result => ({
      ...result,
      boards: this.mapNumbersToBoards(result.numbers)
    }));
  }

  private mapNumbersToBoards(numbers: string) {
    if (numbers.length !== 5) {
      throw new BadRequestException('Numbers must be a 5-digit string');
    }

    //example: "17362" -> A=3, B=6, C=2, AB=36, AC=32, BC=62, ABC=362, ABCD=7362

    const [, a, b, c, d] = numbers.split('');

    return {
      A: b,
      B: c,
      C: d,
      AB: b + c,
      AC: b + d,
      BC: c + d,
      ABC: b + c + d,
      ABCD: a + b + c + d
    };
  }

  async analyzeOptimalResult(showTime: string) {
    // Get all game history for the specific show time
    const gameHistories = await this.prisma.gameHistory.findMany({
      where: {
        showTime: new Date(showTime)
      },
      include: {
        gameplay: true,
        player: {
          select: { username: true }
        }
      }
    });

    if (gameHistories.length === 0) {
      return { message: 'No games found for this show time' };
    }

    let maxProfit = -Infinity;
    let optimalNumber = '';
    let analysis: Array<{
      number: string;
      boards: any;
      profit: number;
      totalBetAmount: number;
      totalWinAmount: number;
      winningBets: number;
      totalBets: number;
      winRate: string | number;
    }> = [];

    // Test all possible 5-digit combinations (11111 to 99999, excluding numbers with 0)
    for (let num = 11111; num < 100000; num++) {
      const fiveDigitNumber = num.toString();
      
      // Skip numbers containing zeros
      if (fiveDigitNumber.includes('0')) {
        continue;
      }
      
      const boards = this.mapNumbersToBoards(fiveDigitNumber);
      
      let totalProfit = 0;
      let totalBetAmount = 0;
      let totalWinAmount = 0;
      let winningBets = 0;
      let totalBets = 0;

      // Calculate profit for this number combination
      for (const history of gameHistories) {
        for (const gameplay of history.gameplay) {
          totalBets++;
          totalBetAmount += gameplay.amount;
          
          // Check if this bet wins with current number
          const isWinning = this.checkIfBetWins(gameplay, boards);
          
          if (isWinning) {
            winningBets++;
            // Calculate win amount based on game rules
            const winAmount = this.calculateWinAmount(gameplay);
            totalWinAmount += winAmount;
            totalProfit -= winAmount; // Loss for house
          } else {
            totalProfit += gameplay.amount; // Profit for house
          }
        }
      }

      if (totalProfit > maxProfit) {
        maxProfit = totalProfit;
        optimalNumber = fiveDigitNumber;
      }

      // Store analysis for top results
      analysis.push({
        number: fiveDigitNumber,
        boards,
        profit: totalProfit,
        totalBetAmount,
        totalWinAmount,
        winningBets,
        totalBets,
        winRate: totalBets > 0 ? (winningBets / totalBets * 100).toFixed(2) : 0
      });
    }

    analysis.sort((a, b) => b.profit - a.profit);
    const topResults = analysis.slice(0, 5);

    return {
      optimalNumber,
      maxProfit,
      boards: this.mapNumbersToBoards(optimalNumber),
      topResults,
      summary: {
        totalGameHistories: gameHistories.length,
        totalBets: analysis[0]?.totalBets || 0,
        analysisComplete: true
      }
    };
  }

  private checkIfBetWins(gameplay: any, boards: any): boolean {
    const { board, numbers, betType } = gameplay;
    
    // Get the winning number for the specific board
    const winningNumber = boards[board];
    
    if (!winningNumber) return false;

    // Parse the bet numbers
    let betNumbers: string[];
    try {
      if (typeof numbers === 'string') {
        // Try to parse as JSON first
        try {
          betNumbers = JSON.parse(numbers);
        } catch {
          // If JSON parse fails, treat as single number
          betNumbers = [numbers];
        }
      } else if (Array.isArray(numbers)) {
        betNumbers = numbers.map(n => n.toString());
      } else {
        betNumbers = [numbers.toString()];
      }
    } catch {
      betNumbers = [numbers.toString()];
    }

    // Ensure betNumbers is an array
    if (!Array.isArray(betNumbers)) {
      betNumbers = [String(betNumbers)];
    }

    // Check if any of the bet numbers match the winning number
    return betNumbers.some(betNum => betNum.toString() === winningNumber.toString());
  }

  private calculateWinAmount(gameplay: any): number {
    // Get game details to calculate win amount
    const { gameId, amount, qty } = gameplay;
    
    // This should be based on your game's winning multipliers
    // For now, using a simple calculation - you should adjust based on actual game rules
    const baseMultiplier = {
      1: 10, // Single digit games
      2: 90, // Double digit games  
      3: 900, // Triple digit games
      4: 9000 // Four digit games
    };

    const multiplier = baseMultiplier[gameId] || 10;
    return amount * qty * multiplier;
  }

  async remove(id: number) {
    return this.prisma.result.delete({
      where: { id }
    });
  }
}