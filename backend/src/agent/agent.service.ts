import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name?: string; username: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const agent = await this.prisma.agent.create({
      data: {
        ...data,
        password: hashedPassword,
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
    const agent = await this.prisma.agent.findUnique({
      where: { username },
      include: { wallet: true },
    });

    if (!agent || !(await bcrypt.compare(password, agent.password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: agent.id, username: agent.username, type: 'agent' }, { expiresIn: '999y' });
    return { agent: { ...agent, password: undefined }, token };
  }

  async getWallet(agentId: number) {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }
    const wallet = await this.prisma.agentWallet.findUnique({
      where: { agentId },
    });
    return { balance: wallet?.balance || 0 };
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

    return {
      ...agent,
      password: undefined,
      playerCount: agent.players.length,
      totalCommission: 0 // Placeholder for future commission calculation 
    };
  }

  // findall except password
  async findAll() {
    return this.prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        referCode: true,
        isActive: true,
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
}