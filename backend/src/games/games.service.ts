import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PlayGameDto } from './dto/play-game.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  create(createGameDto: CreateGameDto) {
    return this.prisma.game.create({
      data: createGameDto,
    });
  }

  findAll() {
    return this.prisma.game.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.game.findUnique({
      where: { id },
    });
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    return this.prisma.game.update({
      where: { id },
      data: updateGameDto,
    });
  }

  remove(id: number) {
    return this.prisma.game.delete({
      where: { id },
    });
  }

  async toggleActive(id: number) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game) throw new Error('Game not found');
    return this.prisma.game.update({
      where: { id },
      data: { isActive: !game.isActive },
    });
  }

  async playGame(playerId: number, playGameDto: PlayGameDto) {
    const { categoryId, category, showtimeId, showTime, playStart, playEnd, gameplay } = playGameDto;
    
    // Check if current time is within play window
    const now = new Date();
    const playStartTime = new Date(playStart);
    const playEndTime = new Date(playEnd);
    
    if (now < playStartTime || now > playEndTime) {
      throw new BadRequestException('Game is not available for play at this time');
    }

    // Check if player has already played for this showtime
    const existingPlay = await this.prisma.gameHistory.findFirst({
      where: {
        playerId,
        showtimeId,
      },
    });

    if (existingPlay) {
      throw new BadRequestException('You have already played for this showtime');
    }
    
    const totalBetAmount = gameplay.reduce((sum, game) => sum + game.amount, 0);
    const totalWinAmount = gameplay.reduce((sum, game) => sum + game.winAmount, 0);

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { wallet: true, agent: { include: { wallet: true } } },
    });

    if (!player || !player.wallet) {
      throw new BadRequestException('Player or wallet not found');
    }

    if (player.wallet.balance < totalBetAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate agent commission based on individual game commission rates
    let agentCommission = 0;
    if (player.agent) {
      for (const game of gameplay) {
        const commission = await this.prisma.agentCommission.findUnique({
          where: {
            agentId_gameId: {
              agentId: player.agentId as number,
              gameId: game.gameId,
            },
          },
        });
        const commissionRate = commission?.commissionRate || 0;
        const gameCommission = commissionRate;
        console.log(`Game ${game.gameId}: Amount ${game.amount}, Commission Rate ₹${commissionRate}, Commission ${gameCommission}`);
        agentCommission += gameCommission;
      }
      console.log(`Total agent commission: ₹${agentCommission}`);
    }

    const gameHistory = await this.prisma.gameHistory.create({
      data: {
        playerId,
        categoryId,
        showtimeId,
        showTime: new Date(showTime),
        playStart: new Date(playStart),
        playEnd: new Date(playEnd),
        totalBetAmount,
        totalWinAmount,
        agentCommission,
        gameplay: {
          create: gameplay.map(game => ({
            gameId: game.gameId,
            board: game.board,
            betType: game.betType as any,
            numbers: typeof game.numbers === 'object' ? JSON.stringify(game.numbers) : game.numbers.toString(),
            qty: game.qty,
            amount: game.amount,
            winAmount: game.winAmount,
          }))
        }
      },
      include: {
        gameplay: true
      }
    });

    const netChange = totalWinAmount - totalBetAmount;
    await this.prisma.playerWallet.update({
      where: { playerId },
      data: {
        balance: {
          increment: netChange,
        },
      },
    });

    if (agentCommission > 0 && player.agent) {
      await this.prisma.agentWallet.update({
        where: { agentId: player.agentId as number },
        data: {
          balance: { increment: agentCommission },
        },
      });
    }

    return {
      ...gameHistory,
      message: 'Game completed successfully!',
    };
  }



  async getPlayerHistory(playerId: number) {
    return this.prisma.gameHistory.findMany({
      where: { playerId },
      include: {
        gameplay: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}