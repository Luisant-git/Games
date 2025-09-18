import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async calculateDashboardMetrics() {
    const totalBetAmount = await this.getTotalBetAmount();
    const totalAgentCommission = await this.getTotalAgentCommission();
    const totalProfit = totalBetAmount - totalAgentCommission;

    return {
      success: true,
      data: {
        totalBetAmount,
        totalAgentCommission,
        totalProfit
      }
    };
  }

  private async getTotalBetAmount(): Promise<number> {
    const result = await this.prisma.gameHistory.aggregate({
      _sum: {
        totalBetAmount: true
      }
    });
    return Math.floor(result._sum.totalBetAmount || 0);
  }

  private async getTotalAgentCommission(): Promise<number> {
    const result = await this.prisma.gameHistory.aggregate({
      _sum: {
        agentCommission: true
      }
    });
    return Math.floor(result._sum.agentCommission || 0);
  }

  async updateDashboard() {
    const metrics = await this.calculateDashboardMetrics();
    
    const existingDashboard = await this.prisma.dashBoard.findFirst();
    
    if (existingDashboard) {
      await this.prisma.dashBoard.update({
        where: { id: existingDashboard.id },
        data: metrics.data
      });
    } else {
      await this.prisma.dashBoard.create({
        data: metrics.data
      });
    }
    
    return { ok: true };
  }
}