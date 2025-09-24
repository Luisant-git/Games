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

      for (const history of gameHistories) {
        for (const gameplay of history.gameplay) {
          totalBets++;
          totalBetAmount += gameplay.amount;
          
          const isWinning = this.checkIfBetWins(gameplay, boards);
          
          if (isWinning) {
            winningBets++;
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
    
    const winningNumber = boards[board];
    
    if (!winningNumber) return false;

    let betNumbers: string[];
    try {
      if (typeof numbers === 'string') {
        try {
          betNumbers = JSON.parse(numbers).map(n => n.toString());
        } catch {
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

    if (betType === 'TRIPLE_DIGIT' || betType === 'FOUR_DIGIT') {
      const combinedBetNumber = betNumbers.join('');
      return combinedBetNumber === winningNumber.toString();
    }

    return betNumbers.some(betNum => betNum.toString() === winningNumber.toString());
  }

  private async calculateWinAmount(gameplay: any, boards: any): Promise<number> {
    const { gameId, amount, qty, board, numbers } = gameplay;
    
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return 0;

    const winningNumber = boards[board];
    
    let betNumbers: string[];
    try {
      if (typeof numbers === 'string') {
        try {
          betNumbers = JSON.parse(numbers).map(n => n.toString());
        } catch {
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
    
    console.log('CHECK NUMBER: ',winningNumber, betNumbers, 'betType:', gameplay.betType);
    
    
    let combinedBetNumber = '';
    if (gameplay.betType === 'TRIPLE_DIGIT' || gameplay.betType === 'FOUR_DIGIT') {
      combinedBetNumber = betNumbers.join('');
      console.log('Combined bet number:', combinedBetNumber, 'vs winning:', winningNumber);
    }
    
    // Check if bet wins
    const isWinning = (gameplay.betType === 'TRIPLE_DIGIT' || gameplay.betType === 'FOUR_DIGIT') 
      ? combinedBetNumber === winningNumber.toString()
      : betNumbers.some(betNum => betNum.toString() === winningNumber.toString());
    
    if (!isWinning) return 0;

    // For multi-digit games, check partial matches
    if (gameplay.betType === 'TRIPLE_DIGIT' || gameplay.betType === 'FOUR_DIGIT') {
      const betNum = combinedBetNumber || betNumbers.join('');
      const winNum = winningNumber.toString();
      
      console.log(`Multi-digit calculation: betType=${gameplay.betType}, betNum=${betNum}, winNum=${winNum}`);
      
      if (betNum === winNum) {
        const winAmount = (game.winningAmount || 0) * qty;
        console.log(`Exact match: winAmount=${winAmount} (${game.winningAmount} * ${qty})`);
        return winAmount;
      }
      
      if (gameplay.betType === 'TRIPLE_DIGIT') {
        // Check last 2 digits match
        if (betNum.slice(-2) === winNum.slice(-2)) {
          const winAmount = (game.doubleDigitMatching || 0) * qty;
          console.log(`Triple-digit 2-digit match: ${betNum.slice(-2)} == ${winNum.slice(-2)}, winAmount=${winAmount}`);
          return winAmount;
        }
        // Check last digit match
        if (betNum.slice(-1) === winNum.slice(-1)) {
          const winAmount = (game.singleDigitMatching || 0) * qty;
          console.log(`Triple-digit 1-digit match: ${betNum.slice(-1)} == ${winNum.slice(-1)}, winAmount=${winAmount}`);
          return winAmount;
        }
      }
      
      if (gameplay.betType === 'FOUR_DIGIT') {
        // Check last 3 digits match
        if (betNum.slice(-3) === winNum.slice(-3)) {
          const winAmount = (game.tripleDigitMatching || 0) * qty;
          console.log(`Four-digit 3-digit match: ${betNum.slice(-3)} == ${winNum.slice(-3)}, winAmount=${winAmount}`);
          return winAmount;
        }
        // Check last 2 digits match
        if (betNum.slice(-2) === winNum.slice(-2)) {
          const winAmount = (game.doubleDigitMatching || 0) * qty;
          console.log(`Four-digit 2-digit match: ${betNum.slice(-2)} == ${winNum.slice(-2)}, winAmount=${winAmount}`);
          return winAmount;
        }
        // Check last digit match
        if (betNum.slice(-1) === winNum.slice(-1)) {
          const winAmount = (game.singleDigitMatching || 0) * qty;
          console.log(`Four-digit 1-digit match: ${betNum.slice(-1)} == ${winNum.slice(-1)}, winAmount=${winAmount}`);
          return winAmount;
        }
      }
      console.log(`No partial matches found for ${gameplay.betType}`);
    }
    
    // For exact matches or single/double digit games
    const finalWinAmount = (game.winningAmount || 0) * qty;
    console.log(`Final win amount: ${finalWinAmount} (${game.winningAmount} * ${qty})`);
    return finalWinAmount;
  }

  async publishResult(id: number) {
    const result = await this.prisma.result.findUnique({ where: { id } });
    if (!result) {
      throw new BadRequestException('Result not found');
    }
    
    if (result.isPublished) {
      throw new BadRequestException('Result already published');
    }
    
    // Check if another result is already published for the same date and time
    const existingPublished = await this.prisma.result.findFirst({
      where: {
        date: result.date,
        time: result.time,
        isPublished: true,
        id: { not: id }
      }
    });
    
    if (existingPublished) {
      throw new BadRequestException('A result is already published for this date and time');
    }

    const boards = this.mapNumbersToBoards(result.numbers);
    
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

      // Update wallets based on win/loss
      if (totalWinAmount > 0) {
        // Player wins - add to player wallet
        if (history.playerId) {
          await this.prisma.playerWallet.update({
            where: { playerId: history.playerId },
            data: { balance: { increment: totalWinAmount } }
          });
        }
      } else {
        // Agent wins - add bet amount to agent wallet
        const totalBetAmount = history.gameplay.reduce((sum, gameplay) => sum + gameplay.amount, 0);
        if (history.agentId) {
          await this.prisma.agentWallet.update({
            where: { agentId: history.agentId },
            data: { balance: { increment: totalBetAmount } }
          });
        }
      }
    }

    // Mark result as published
    const updatedResult = await this.prisma.result.update({
      where: { id },
      data: { isPublished: true }
    });
    
    return {
      message: 'Result published successfully',
      result: { ...updatedResult, boards },
      affectedGameHistories: gameHistories.length
    };
  }
}