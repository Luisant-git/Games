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
        agent: { select: { id: true, username: true, name: true } },
        player: { select: { username: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const rawData = await Promise.all(
      gameHistories.map(async (gh) => {
        const totalAmount = gh.gameplay.reduce((sum, play) => sum + play.amount, 0);
        const entries = gh.gameplay.length;
        const commission = gh.agentCommission;
        const balance = totalAmount - commission;

        const category = gh.categoryId ? await this.prisma.category.findUnique({ where: { id: gh.categoryId } }) : null;
        const showtimeRecord = gh.showtimeId ? await this.prisma.showTime.findUnique({ where: { id: gh.showtimeId } }) : null;
        const formattedShowtime = showtimeRecord?.showTime || '-';
        
        const winningNumbers = gh.isWon ? gh.gameplay.filter(p => p.winAmount && p.winAmount > 0).map(p => `${p.board}-${p.numbers}`) : [];
        const winningAmount = gh.totalWinAmount;
        const profit = balance - winningAmount;

        return {
          gameHistory: gh,
          category: category?.name || '-',
          categoryId: gh.categoryId,
          showtimeId: gh.showtimeId,
          showDate: gh.createdAt.toLocaleDateString('en-US'),
          showtime: formattedShowtime,
          entries,
          totalAmount,
          commission,
          balance,
          winningNos: winningNumbers,
          winningAmount,
          profit,
        };
      }),
    );

    const grouped = rawData.reduce((acc, item) => {
      const key = `${item.category}_${item.showDate}_${item.showtime}`;
      
      if (!acc[key]) {
        acc[key] = {
          category: item.category,
          categoryId: item.categoryId,
          showtimeId: item.showtimeId,
          showDate: item.showDate,
          showtime: item.showtime,
          entries: 0,
          totalAmount: 0,
          commission: 0,
          balance: 0,
          winningNos: [],
          winningAmount: 0,
          profit: 0,
          gameHistories: [],
        };
      }
      
      acc[key].entries += item.entries;
      acc[key].totalAmount += item.totalAmount;
      acc[key].commission += item.commission;
      acc[key].balance += item.balance;
      acc[key].winningAmount += item.winningAmount;
      acc[key].profit += item.profit;
      acc[key].winningNos.push(...item.winningNos);
      acc[key].gameHistories.push(item.gameHistory);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item, index) => {
      const agentMap = new Map();
      const winningResults: any[] = [];

      item.gameHistories.forEach((gh) => {
        const agentId = gh.agentId;
        if (!agentMap.has(agentId)) {
          agentMap.set(agentId, {
            agentName: gh.agent?.name || gh.agent?.username || '-',
            entries: 0,
            totalAmount: 0,
            commission: 0,
            balance: 0,
            winningAmount: 0,
            profit: 0,
          });
        }
        const agentData = agentMap.get(agentId);
        const totalAmt = gh.gameplay.reduce((sum, play) => sum + play.amount, 0);
        agentData.entries += gh.gameplay.length;
        agentData.totalAmount += totalAmt;
        agentData.commission += gh.agentCommission;
        agentData.balance += totalAmt - gh.agentCommission;
        agentData.winningAmount += gh.totalWinAmount;
        agentData.profit += totalAmt - gh.agentCommission - gh.totalWinAmount;

        gh.gameplay.forEach((play) => {
          if (play.winAmount && play.winAmount > 0) {
            winningResults.push({
              username: gh.player?.username || gh.agent?.username || '-',
              userType: gh.player ? 'Player' : 'Agent',
              boardName: play.board,
              number: play.numbers,
              qty: play.qty,
              rate: play.amount,
              totalAmount: play.amount * play.qty,
              winningAmount: play.winAmount,
            });
          }
        });
      });

      return {
        sno: index + 1,
        category: item.category,
        showDate: item.showDate,
        showtime: item.showtime,
        entries: item.entries,
        totalAmount: item.totalAmount,
        commission: item.commission,
        balance: item.balance,
        winningNo: item.winningNos.length > 0 ? item.winningNos.join(', ') : '-',
        winningAmount: item.winningAmount,
        profit: item.profit,
        agentReport: Array.from(agentMap.values()).map((agent, idx) => ({
          sno: idx + 1,
          agentName: agent.agentName,
          entries: agent.entries,
          totalAmount: agent.totalAmount,
          commission: agent.commission,
          balance: agent.balance,
          winningAmount: agent.winningAmount,
          profit: agent.profit,
        })),
        winningReport: winningResults.map((win, idx) => ({
          sno: idx + 1,
          username: win.username,
          userType: win.userType,
          boardName: win.boardName,
          number: win.number,
          qty: win.qty,
          rate: win.rate,
          totalAmount: win.totalAmount,
          winningAmount: win.winningAmount,
        })),
      };
    });
  }


}
