import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SummaryReportFilterDto } from './dto/summary-report-filter.dto';

@Injectable()
export class SummaryReportService {
  constructor(private prisma: PrismaService) {}

  async getSummaryReport(filterDto: SummaryReportFilterDto) {
    const fromDate = filterDto.fromDate ? new Date(filterDto.fromDate) : new Date();
    const toDate = filterDto.toDate ? new Date(filterDto.toDate) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const gameHistories = await this.prisma.gameHistory.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        gameplay: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const summaryData = await Promise.all(
      gameHistories.map(async (gh, index) => {
        const totalAmount = gh.gameplay.reduce((sum, play) => sum + play.amount * play.qty, 0);
        const entries = gh.gameplay.length;
        const commission = gh.agentCommission;
        const balance = totalAmount - commission;

        const category = await this.prisma.category.findUnique({ where: { id: gh.categoryId } });
        const showtime = await this.prisma.showTime.findUnique({ where: { id: gh.showtimeId } });
        
        const winningNumber = gh.isWon ? gh.gameplay.find(p => p.winAmount && p.winAmount > 0)?.numbers : null;
        const winningAmount = gh.totalWinAmount;
        const profit = balance - winningAmount;

        return {
          sno: index + 1,
          category: category?.name || '-',
          showDate: gh.createdAt.toLocaleDateString('en-US'),
          showtime: showtime?.showTime || '-',
          entries,
          totalAmount,
          commission,
          balance,
          winningNo: winningNumber || '-',
          winningAmount,
          profit,
        };
      }),
    );

    return summaryData;
  }

  async getAgentReport(filterDto: SummaryReportFilterDto) {
    const fromDate = filterDto.fromDate ? new Date(filterDto.fromDate) : new Date();
    const toDate = filterDto.toDate ? new Date(filterDto.toDate) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const agents = await this.prisma.agent.findMany();

    const agentData = await Promise.all(
      agents.map(async (agent, index) => {
        const gameHistories = await this.prisma.gameHistory.findMany({
          where: {
            agentId: agent.id,
            createdAt: { gte: fromDate, lte: toDate },
          },
          include: { gameplay: true },
        });

        const allPlays = gameHistories.flatMap((gh) => gh.gameplay);
        const totalAmount = allPlays.reduce((sum, play) => sum + play.amount * play.qty, 0);
        const entries = allPlays.length;
        const commission = gameHistories.reduce((sum, gh) => sum + gh.agentCommission, 0);
        const balance = totalAmount - commission;
        const winningAmount = gameHistories.reduce((sum, gh) => sum + gh.totalWinAmount, 0);
        const profit = balance - winningAmount;

        return {
          sno: index + 1,
          agentName: agent.name || agent.username,
          entries,
          totalAmount,
          commission,
          balance,
          winningAmount,
          profit,
        };
      }),
    );

    return agentData;
  }

  async getWinningResult(filterDto: SummaryReportFilterDto) {
    const fromDate = filterDto.fromDate ? new Date(filterDto.fromDate) : new Date();
    const toDate = filterDto.toDate ? new Date(filterDto.toDate) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const gamePlays = await this.prisma.gamePlay.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        winAmount: { gt: 0 },
      },
    });

    const winningData = gamePlays.map((play, index) => ({
      sno: index + 1,
      boardName: play.board,
      number: play.numbers,
      qty: play.qty,
      rate: play.amount,
      totalAmount: play.amount * play.qty,
      winningAmount: play.winAmount,
    }));

    return winningData;
  }
}
