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
            const winAmount = await this.calculateWinAmount(gameplay, boards);
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

  private async calculateWinAmount(gameplay: any, boards: any): Promise<number> {
    const { gameId, amount, qty, board, numbers } = gameplay;
    
    // Get game configuration
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return 0;

    const winningNumber = boards[board];
    const betNumbers = Array.isArray(numbers) ? numbers : [numbers];
    
    // Check if bet wins
    const isWinning = betNumbers.some(betNum => betNum.toString() === winningNumber.toString());
    if (!isWinning) return 0;

    // For multi-digit games, check partial matches
    if (game.betType === 'TRIPLE_DIGIT' || game.betType === 'FOUR_DIGIT') {
      const betNum = betNumbers[0].toString();
      const winNum = winningNumber.toString();
      
      // Check for exact match first
      if (betNum === winNum) {
        return (game.winningAmount || 0) * qty;
      }
      
      // Check partial matches for multi-digit games
      if (game.betType === 'TRIPLE_DIGIT') {
        // Check last 2 digits match
        if (betNum.slice(-2) === winNum.slice(-2)) {
          return (game.doubleDigitMatching || 0) * qty;
        }
        // Check last digit match
        if (betNum.slice(-1) === winNum.slice(-1)) {
          return (game.singleDigitMatching || 0) * qty;
        }
      }
      
      if (game.betType === 'FOUR_DIGIT') {
        // Check last 3 digits match
        if (betNum.slice(-3) === winNum.slice(-3)) {
          return (game.tripleDigitMatching || 0) * qty;
        }
        // Check last 2 digits match
        if (betNum.slice(-2) === winNum.slice(-2)) {
          return (game.doubleDigitMatching || 0) * qty;
        }
        // Check last digit match
        if (betNum.slice(-1) === winNum.slice(-1)) {
          return (game.singleDigitMatching || 0) * qty;
        }
      }
    }
    
    // For exact matches or single/double digit games
    return (game.winningAmount || 0) * qty;
  }

  async publishResult(id: number) {
    const result = await this.prisma.result.findUnique({ where: { id } });
    if (!result) {
      throw new BadRequestException('Result not found');
    }

    const boards = this.mapNumbersToBoards(result.numbers);
    
    // Find all game histories for this result's date (comparing date part only)
    const resultDate = new Date(result.date);
    const startOfDay = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate());
    const endOfDay = new Date(resultDate.getFullYear(), resultDate.getMonth(), resultDate.getDate() + 1);
    
    const gameHistories = await this.prisma.gameHistory.findMany({
      where: {
        showTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        gameplay: true
      }
    });
    console.log('RESULT-DATE',result.date);
    
    console.log('game-histories',gameHistories);
    
    // Calculate winnings for each gameplay
    for (const history of gameHistories) {
      let totalWinAmount = 0;
      
      for (const gameplay of history.gameplay) {
        const isWinning = this.checkIfBetWins(gameplay, boards);
        
        if (isWinning) {
          const winAmount = await this.calculateWinAmount(gameplay, boards);
          
          // Update gameplay with win amount
          await this.prisma.gamePlay.update({
            where: { id: gameplay.id },
            data: { winAmount }
          });
          
          totalWinAmount += winAmount;
        }
      }
      
      // Update game history with total win amount and win status
      await this.prisma.gameHistory.update({
        where: { id: history.id },
        data: {
          totalWinAmount,
          isWon: totalWinAmount > 0
        }
      });
    }

    return {
      message: 'Result published successfully',
      result: { ...result, boards },
      affectedGameHistories: gameHistories.length
    };
  }

  async remove(id: number) {
    return this.prisma.result.delete({
      where: { id }
    });
  }
}