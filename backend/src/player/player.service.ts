import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; username: string; phone?: string; password: string; referalCode?: string }) {
    const existingPlayer = await this.prisma.player.findUnique({
      where: { username: data.username },
    });

    if (existingPlayer) {
      throw new BadRequestException('Username already exists');
    }

    if (data.phone) {
      const existingPhone = await this.prisma.player.findUnique({
        where: { phone: data.phone },
      });

      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    let agentId: number | undefined = undefined;
    let referredBy: string | undefined = undefined;
    
    if (data.referalCode) {
      // Check if it's an agent referral code
      const agent = await this.prisma.agent.findUnique({
        where: { referCode: data.referalCode },
      });
      if (agent) {
        agentId = agent.id;
      } else {
        // Check if it's a player referral code
        const referrer = await this.prisma.player.findUnique({
          where: { referCode: data.referalCode },
        });
        if (referrer) {
          referredBy = data.referalCode;
        }
      }
    }

    const player = await this.prisma.player.create({
      data: {
        ...data,
        password: hashedPassword,
        agentId,
        referredBy,
        wallet: {
          create: {
            balance: 0,
            bonusBalance: 0,
          },
        },
      },
      include: {
        wallet: true,
        agent: true,
      },
    });

    // If referred by another player, create referral bonus
    if (referredBy) {
      const referrer = await this.prisma.player.findUnique({
        where: { referCode: referredBy },
        include: { wallet: true },
      });
      
      if (referrer) {
        // Create referral bonus record
        await this.prisma.referralBonus.create({
          data: {
            referrerId: referrer.id,
            referredId: player.id,
            amount: 100,
          },
        });
        
        // Add bonus to referrer's wallet
        await this.prisma.playerWallet.update({
          where: { playerId: referrer.id },
          data: {
            bonusBalance: {
              increment: 100,
            },
          },
        });
      }
    }

    const token = this.jwtService.sign({ id: player.id, username: player.username, type: 'player' }, { expiresIn: '999y' });
    return { player: { ...player, password: undefined }, token };
  }

  async login(username: string, password: string) {
    try {
      const player = await this.prisma.player.findUnique({
        where: { username },
        include: { wallet: true, agent: true },
      });

      if (!player || !(await bcrypt.compare(password, player.password))) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.jwtService.sign({ id: player.id, username: player.username, type: 'player' }, { expiresIn: '999y' });
      return { player: { ...player, password: undefined }, token };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
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
    return { 
      balance: wallet?.balance || 0,
      bonusBalance: wallet?.bonusBalance || 0,
      totalBalance: (wallet?.balance || 0) + (wallet?.bonusBalance || 0)
    };
  }

  async getPlayerProfile(playerId: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: {
        wallet: true,
        agent: true,
        gameHistory: true,
      },
    });

    if (player) {
      // Count referred players
      const referredPlayersCount = await this.prisma.player.count({
        where: { referredBy: player.referCode },
      });

      return {
        ...player,
        referredPlayersCount,
      };
    }

    return player;
  }

  async changePassword(playerId: number, currentPassword: string, newPassword: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player || !(await bcrypt.compare(currentPassword, player.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await this.prisma.player.update({
      where: { id: playerId },
      data: { password: hashedNewPassword },
    });

    return { success: true, message: 'Password changed successfully' };
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