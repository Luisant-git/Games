import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name?: string; username: string; phone?: string; password: string }) {
    const existingAgent = await this.prisma.agent.findUnique({
      where: { username: data.username },
    });

    if (existingAgent) {
      throw new BadRequestException('Username already exists');
    }

    const existingPlayer = await this.prisma.player.findUnique({
      where: { username: data.username },
    });

    if (existingPlayer) {
      throw new BadRequestException('Username already exists');
    }

    if (data.phone) {
      const existingPhone = await this.prisma.agent.findUnique({
        where: { phone: data.phone },
      });
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Generate unique 8-character referCode
    let referCode = '';
    let isUnique = false;
    while (!isUnique) {
      referCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await this.prisma.agent.findUnique({ where: { referCode } });
      if (!existing) {
        const existingPlayer = await this.prisma.player.findUnique({ where: { referCode } });
        if (!existingPlayer) isUnique = true;
      }
    }
    
    const agent = await this.prisma.agent.create({
      data: {
        name: data.name,
        username: data.username,
        phone: data.phone,
        password: hashedPassword,
        plainPassword: data.password,
        referCode,
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    // Create default commission (0) for all existing games
    const allGames = await this.prisma.game.findMany();
    const commissionData = allGames.map(game => ({
      agentId: agent.id,
      gameId: game.id,
      commissionRate: 0,
    }));
    
    if (commissionData.length > 0) {
      await this.prisma.agentCommission.createMany({
        data: commissionData,
      });
    }

    const token = this.jwtService.sign({ id: agent.id, username: agent.username, type: 'agent' }, { expiresIn: '999y' });
    return { agent: { ...agent, password: undefined }, token };
  }

  async login(username: string, password: string) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { username },
        include: { wallet: true },
      });

      if (!agent || !(await bcrypt.compare(password, agent.password))) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.jwtService.sign({ id: agent.id, username: agent.username, type: 'agent' }, { expiresIn: '999y' });
      return { agent: { ...agent, password: undefined }, token };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
  }

  async getWallet(agentId: number) {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }
    const wallet = await this.prisma.agentWallet.findUnique({
      where: { agentId },
    });
    return { balance: Math.round((wallet?.balance || 0) * 100) / 100 };
  }

  async updateWallet(agentId: number, amount: number) {
    return this.prisma.agentWallet.update({
      where: { agentId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async getAgentProfile(agentId: number) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: { 
        wallet: true, 
        players: {
          select: {
            id: true,
            username: true,
            phone: true,
            createdAt: true
          }
        }
      },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const totalCommission = await this.prisma.agentCommission.aggregate({
      where: { agentId },
      _sum: { amount: true }
    });

    return {
      ...agent,
      password: undefined,
      playerCount: agent.players.length,
      totalCommission: totalCommission._sum.amount || 0
    };
  }

  // findall except password
  async findAll() {
    return this.prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        plainPassword: true,
        referCode: true,
        isActive: true,
        canPlay: true,
        createdAt: true,
        wallet: true,
        players: {
          select: {
            id: true,
            username: true,
            phone: true,
            createdAt: true
          }
        }
      },
    });
  }

  async toggleStatus(agentId: number) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    return this.prisma.agent.update({
      where: { id: agentId },
      data: {
        isActive: !agent.isActive,
      },
    });
  }

  async getAgentCommissions(agentId: number) {
    await this.syncAgentCommissions(agentId);
    
    const data = await this.prisma.agentCommission.findMany({
      where: { agentId },
      include: {
        game: {
          select: {
            id: true,
            betType: true,
            board: true,
            ticket: true,
            isActive: true,
          },
        },
      },
    });
    
    console.log('?????????????????????',data);

    return data;
  }

  async syncAgentCommissions(agentId: number) {
    const allGames = await this.prisma.game.findMany();
    const existingCommissions = await this.prisma.agentCommission.findMany({
      where: { agentId },
      select: { gameId: true },
    });
    
    const existingGameIds = existingCommissions.map(c => c.gameId);
    const missingGames = allGames.filter(game => !existingGameIds.includes(game.id));
    
    if (missingGames.length > 0) {
      await this.prisma.agentCommission.createMany({
        data: missingGames.map(game => ({
          agentId,
          gameId: game.id,
          commissionRate: 0,
        })),
      });
    }
  }

  async updateCommission(agentId: number, gameId: number, commissionRate: number) {
    return this.prisma.agentCommission.upsert({
      where: {
        agentId_gameId: {
          agentId,
          gameId,
        },
      },
      update: {
        commissionRate,
      },
      create: {
        agentId,
        gameId,
        commissionRate,
      },
    });
  }

  // Agent Gameplay Methods
  async playGame(agentId: number, gameData: {
    categoryId: number;
    showtimeId: number;
    showTime: Date;
    playStart: Date;
    playEnd: Date;
    gameplay: Array<{
      gameId: number;
      board: string;
      betType: string;
      numbers: string;
      qty: number;
      amount: number;
    }>;
  }) {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
        include: { wallet: true }
      });

      if (!agent) {
        throw new BadRequestException('Agent not found');
      }

      if (!agent.canPlay) {
        throw new BadRequestException('Agent is not allowed to play games');
      }

      const totalBetAmount = gameData.gameplay.reduce((sum, game) => sum + game.amount, 0);
      
      // Get total commission amount
      const totalCommission = await this.prisma.agentCommission.aggregate({
        where: { agentId },
        _sum: { amount: true }
      });
      
      const walletBalance = agent.wallet?.balance || 0;
      const commissionBalance = totalCommission._sum.amount || 0;
      const totalAvailable = walletBalance + commissionBalance;
      
      if (totalAvailable < totalBetAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      return this.prisma.$transaction(async (tx) => {
        let remainingAmount = totalBetAmount;
        
        // First deduct from wallet
        if (walletBalance > 0) {
          const walletDeduction = Math.min(walletBalance, remainingAmount);
          await tx.agentWallet.update({
            where: { agentId },
            data: { balance: { decrement: walletDeduction } }
          });
          remainingAmount -= walletDeduction;
        }
        
        // If still need more, deduct from commission
        if (remainingAmount > 0) {
          await tx.agentCommission.updateMany({
            where: { agentId, amount: { gt: 0 } },
            data: { amount: { decrement: remainingAmount } }
          });
        }

        const gameHistory = await tx.gameHistory.create({
          data: {
            agentId,
            categoryId: gameData.categoryId,
            showtimeId: gameData.showtimeId,
            showTime: new Date(gameData.showTime),
            playStart: new Date(gameData.playStart),
            playEnd: new Date(gameData.playEnd),
            totalBetAmount,
            gameplay: {
              create: gameData.gameplay.map(game => ({
                gameId: game.gameId,
                board: game.board,
                betType: game.betType as any,
                numbers: typeof game.numbers === 'object' ? JSON.stringify(game.numbers) : game.numbers.toString(),
                qty: game.qty,
                amount: game.amount
              }))
            }
          },
          include: { gameplay: true }
        });

        return gameHistory;
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to play game');
    }
  }

  async getAgentGameHistory(agentId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [gameHistories, total] = await Promise.all([
      this.prisma.gameHistory.findMany({
        where: { agentId },
        include: { gameplay: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.gameHistory.count({ where: { agentId } })
    ]);

    return {
      data: gameHistories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async togglePlayPermission(agentId: number) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new Error('Agent not found');
    
    return this.prisma.agent.update({
      where: { id: agentId },
      data: { canPlay: !agent.canPlay }
    });
  }

  async changePassword(agentId: number, currentPassword: string, newPassword: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent || !(await bcrypt.compare(currentPassword, agent.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.agent.update({
      where: { id: agentId },
      data: { password: hashedNewPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  async agentMyPlayersGameHistory(agentId: number, page?: number, limit?: number) {
    const queryOptions: any = {
      where: {
        player: {
          agentId: agentId
        }
      },
      include: {
        player: {
          select: {
            id: true,
            username: true
          }
        },
        gameplay: true
      },
      orderBy: { createdAt: 'desc' }
    };

    if (page && limit) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }
    
    const [gameHistories, total] = await Promise.all([
      this.prisma.gameHistory.findMany(queryOptions),
      this.prisma.gameHistory.count({
        where: {
          player: {
            agentId: agentId
          }
        }
      })
    ]);

    const result: any = { data: gameHistories };
    
    if (page && limit) {
      result.pagination = { page, limit, total, totalPages: Math.ceil(total / limit) };
    }

    return result;
  }
}