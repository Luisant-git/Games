import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AgentReportFilterDto } from './dto/agent-report-filter.dto';

@Injectable()
export class AgentReportService {
  constructor(private prisma: PrismaService) {}

  async getAgentReport(filterDto: AgentReportFilterDto) {
    const fromDate = filterDto.fromDate ? new Date(filterDto.fromDate) : new Date();
    const toDate = filterDto.toDate ? new Date(filterDto.toDate) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const where: any = {
      createdAt: { gte: fromDate, lte: toDate },
      playerId: { not: null },
    };

    if (filterDto.categoryId) {
      where.categoryId = Number(filterDto.categoryId);
    }

    if (filterDto.showtimeId) {
      where.showtimeId = Number(filterDto.showtimeId);
    }

    const gameHistories = await this.prisma.gameHistory.findMany({
      where,
      include: {
        agent: true,
        player: true,
        gameplay: true,
      },
    });

    const showtimes = await this.prisma.showTime.findMany({
      include: {
        timing: {
          include: {
            category: true,
          },
        },
      },
    });

    const categories = await this.prisma.category.findMany();

    const agentPlayerMap = new Map();

    gameHistories.forEach((history) => {
      if (!history.player || !history.agent) return;

      const agentId = history.agentId;
      const agentName = history.agent.name || history.agent.username;
      const playerId = history.playerId;
      const playerName = history.player.name || history.player.username;
      const showtime = showtimes.find((st) => st.id === history.showtimeId);
      const category = categories.find((cat) => cat.id === history.categoryId);

      const key = `${agentId}-${playerId}-${history.categoryId}-${history.showtimeId}-${history.showTime.toISOString().split('T')[0]}`;

      if (!agentPlayerMap.has(key)) {
        agentPlayerMap.set(key, {
          agentId,
          agentName,
          playerId,
          playerName,
          category: category?.name || '',
          showDate: history.showTime,
          showtime: showtime?.showTime || '',
          entries: 0,
          totalAmount: 0,
          commission: 0,
          winningAmount: 0,
        });
      }

      const record = agentPlayerMap.get(key);
      record.entries += history.gameplay.length;
      record.totalAmount += history.totalBetAmount;
      record.commission += history.agentCommission;
      record.winningAmount += history.totalWinAmount;
    });

    const result = Array.from(agentPlayerMap.values()).map((item, index) => ({
      sno: index + 1,
      agentName: item.agentName,
      playerName: item.playerName,
      category: item.category,
      showDate: item.showDate,
      showtime: item.showtime,
      entries: item.entries,
      totalAmount: item.totalAmount,
      commission: item.commission,
      winningAmount: item.winningAmount,
    }));

    return result;
  }
}
