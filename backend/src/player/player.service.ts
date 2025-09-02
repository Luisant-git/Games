import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name?: string; email: string; phone?: string; password: string; referalCode?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let agentId: number | undefined = undefined;
    if (data.referalCode) {
      const agent = await this.prisma.agent.findUnique({
        where: { referCode: data.referalCode },
      });
      if (agent) {
        agentId = agent.id;
      }
    }

    const player = await this.prisma.player.create({
      data: {
        ...data,
        password: hashedPassword,
        agentId,
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
      include: {
        wallet: true,
        agent: true,
      },
    });

    const token = this.jwtService.sign({ id: player.id, email: player.email, type: 'player' }, { expiresIn: '999y' });
    return { player: { ...player, password: undefined }, token };
  }

  async login(email: string, password: string) {
    const player = await this.prisma.player.findUnique({
      where: { email },
      include: { wallet: true, agent: true },
    });

    if (!player || !(await bcrypt.compare(password, player.password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({ id: player.id, email: player.email, type: 'player' }, { expiresIn: '999y' });
    return { player: { ...player, password: undefined }, token };
  }

  async gameWin(playerId: number, amount: number) {
    await this.prisma.playerWallet.update({
      where: { playerId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { agent: true },
    });

    if (player?.agent) {
      await this.prisma.agentWallet.update({
        where: { agentId: player.agent.id },
        data: {
          balance: {
            increment: 1,
          },
        },
      });
    }

    return { success: true };
  }

  async getWallet(playerId: number) {
    if (!playerId) {
      throw new Error('Player ID is required');
    }
    const wallet = await this.prisma.playerWallet.findUnique({
      where: { playerId },
    });
    return { balance: wallet?.balance || 0 };
  }

  getPlayerProfile(playerId: number) {
    return this.prisma.player.findUnique({
      where: { id: playerId },
      include: {
        wallet: true,
        agent: true,
        gameHistory: true,
      },
    });
  }

  async findAll() {
    return this.prisma.player.findMany({
      include: {
        wallet: true,
        agent: true,
        gameHistory: true,
      },
    })
  }
}