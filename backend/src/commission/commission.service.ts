import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  async calculatePlayerReferralCommission(playerId: number, agentCommission: number) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { agent: true }
    });

    console.log(`Commission Service - Player ID: ${playerId}, Agent Commission: ₹${agentCommission}`);

    if (!player?.agent || agentCommission <= 0) {
      console.log('No agent or zero commission, skipping');
      return;
    }

    if (player.agentId) {
      const agentId = player.agentId;
      console.log(`Adding ₹${agentCommission} to agent ${agentId} wallet`);
      
      // Update both wallet balance and commission amount in database
      await this.prisma.$transaction(async (tx) => {
        // Add to wallet
        await tx.agentWallet.update({
          where: { agentId },
          data: { balance: { increment: agentCommission } }
        });

        // Update total commission amount for all games this agent has commission for
        await tx.agentCommission.updateMany({
          where: {
            agentId,
            commissionType: 'PLAYER_REFERRAL'
          },
          data: {
            amount: { increment: agentCommission }
          }
        });
      });
      
      console.log(`Commission successfully added to agent wallet and database`);
    }
  }



  async addCommissionToAgent(
    agentId: number,
    amount: number,
    type: 'PLAYER_REFERRAL' | 'GAMEPLAY_BONUS',
    gameId: number,
    fromId?: number
  ) {
    await this.prisma.$transaction(async (tx) => {
      // Add to wallet
      await tx.agentWallet.update({
        where: { agentId },
        data: { balance: { increment: amount } }
      });

      // Update commission amount
      await tx.agentCommission.updateMany({
        where: {
          agentId,
          gameId,
          commissionType: type
        },
        data: {
          amount: { increment: amount },
          fromPlayerId: type === 'PLAYER_REFERRAL' ? fromId : null
        }
      });
    });
  }

  async getCommissionHistory(agentId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [commissions, total] = await Promise.all([
      this.prisma.agentCommission.findMany({
        where: { 
          agentId,
          amount: { gt: 0 }
        },
        include: {
          game: {
            select: {
              id: true,
              betType: true,
              board: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.agentCommission.count({ 
        where: { 
          agentId,
          amount: { gt: 0 }
        }
      })
    ]);

    return {
      data: commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}