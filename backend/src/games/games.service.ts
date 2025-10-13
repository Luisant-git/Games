import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PlayGameDto } from './dto/play-game.dto';
import { CommissionService } from '../commission/commission.service';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private commissionService: CommissionService
  ) {}

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
    
    // Check if current time is within play window (time only, not date)
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const playStartTime = new Date(playStart);
    const playEndTime = new Date(playEnd);
    const startMinutes = playStartTime.getHours() * 60 + playStartTime.getMinutes();
    const endMinutes = playEndTime.getHours() * 60 + playEndTime.getMinutes();
    
    console.log(`Current time: ${now.getHours()}:${now.getMinutes()} (${currentTime} minutes)`);
    console.log(`Play window: ${playStartTime.getHours()}:${playStartTime.getMinutes()} - ${playEndTime.getHours()}:${playEndTime.getMinutes()} (${startMinutes}-${endMinutes} minutes)`);
    
    if (currentTime < startMinutes || currentTime > endMinutes) {
      throw new BadRequestException('Game is not available for play at this time');
    }


    
    const totalBetAmount = gameplay.reduce((sum, game) => sum + game.amount, 0);
    const totalWinAmount = 0; // Will be updated after result declaration

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { wallet: true, agent: { include: { wallet: true } } },
    });

    if (!player || !player.wallet) {
      throw new BadRequestException('Player or wallet not found');
    }

    const totalAvailable = player.wallet.balance + player.wallet.bonusBalance;
    if (totalAvailable < totalBetAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate agent commission based on individual game commission rates (flat rates)
    let agentCommission = 0;
    console.log(`Player agent info:`, { 
      playerId: player.id,
      agentId: player.agentId, 
      hasAgent: !!player.agent,
      agentDetails: player.agent ? { id: player.agent.id, username: player.agent.username } : null
    });
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
        console.log(`Game ${game.gameId}: Amount ${game.amount}, Flat Commission Rate ₹${commissionRate}, Commission ₹${gameCommission}`);
        agentCommission += gameCommission;
      }
      console.log(`Total games played: ${gameplay.length}`);
      console.log(`Total agent commission: ₹${agentCommission}`);
    }

    const gameHistory = await this.prisma.gameHistory.create({
      data: {
        playerId,
        agentId: player.agentId,
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
            winAmount: null,
          }))
        }
      },
      include: {
        gameplay: true
      }
    });

    // Deduct bet amount from wallet and bonus balance
    let remainingAmount = totalBetAmount;
    let walletDeduction = 0;
    let bonusDeduction = 0;

    if (player.wallet.balance >= remainingAmount) {
      // Sufficient balance in main wallet
      walletDeduction = remainingAmount;
    } else {
      // Use main wallet first, then bonus
      walletDeduction = player.wallet.balance;
      bonusDeduction = remainingAmount - player.wallet.balance;
    }

    // Calculate net change for main balance
    const netBalanceChange = totalWinAmount - walletDeduction;
    
    await this.prisma.playerWallet.update({
      where: { playerId },
      data: {
        balance: {
          increment: netBalanceChange,
        },
        bonusBalance: {
          decrement: bonusDeduction,
        },
      },
    });

    if (player.agent && agentCommission > 0) {
      console.log(`Processing commission for agent ${player.agentId}, total: ₹${agentCommission}`);
      // Update specific commission records for games played
      for (const game of gameplay) {
        const commission = await this.prisma.agentCommission.findUnique({
          where: {
            agentId_gameId: {
              agentId: player.agentId as number,
              gameId: game.gameId,
            },
          },
        });
        console.log(`Commission record for game ${game.gameId}:`, commission);
        if (commission && commission.commissionRate > 0) {
          const updated = await this.prisma.agentCommission.update({
            where: { id: commission.id },
            data: { 
              amount: { increment: commission.commissionRate },
              fromPlayerId: playerId
            }
          });
          console.log(`Updated commission record:`, updated);
        }
      }
      
      // Add to agent wallet
      await this.prisma.agentWallet.update({
        where: { agentId: player.agentId as number },
        data: { balance: { increment: agentCommission } }
      });
      console.log(`Added ₹${agentCommission} to agent wallet`);
    } else {
      console.log(`No commission processing: hasAgent=${!!player.agent}, agentId=${player.agentId}, commission=${agentCommission}`);
    }

    return {
      ...gameHistory,
      message: 'Game completed successfully!',
    };
  }



  async getPlayerHistory(playerId: number) {
    const histories = await this.prisma.gameHistory.findMany({
      where: { playerId },
      include: {
        gameplay: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get category names for each history
    const historiesWithCategory = await Promise.all(
      histories.map(async (history) => {
        const category = await this.prisma.category.findUnique({
          where: { id: history.categoryId },
          select: { name: true }
        });
        return {
          ...history,
          categoryName: category?.name || 'Unknown'
        };
      })
    );

    return historiesWithCategory;
  }
}