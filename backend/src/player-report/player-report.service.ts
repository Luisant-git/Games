import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PlayerReportFilterDto } from './dto/player-report-filter.dto';

@Injectable()
export class PlayerReportService {
  constructor(private prisma: PrismaService) {}

  async getPlayerReport(filterDto: PlayerReportFilterDto) {
    const fromDate = filterDto.fromDate ? new Date(filterDto.fromDate) : new Date();
    const toDate = filterDto.toDate ? new Date(filterDto.toDate) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const where: any = {
      createdAt: { gte: fromDate, lte: toDate },
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
        gameplay: true,
      },
    });

    const playerMap = new Map();

    for (const gh of gameHistories) {
      if (!gh.playerId) continue;

      const player = await this.prisma.player.findUnique({
        where: { id: gh.playerId },
      });

      if (!player) continue;

      const category = await this.prisma.category.findUnique({
        where: { id: gh.categoryId },
      });

      const showtime = await this.prisma.showTime.findUnique({
        where: { id: gh.showtimeId },
      });

      const key = `${gh.playerId}-${gh.categoryId}-${gh.showtimeId}-${gh.createdAt.toDateString()}`;

      if (!playerMap.has(key)) {
        playerMap.set(key, {
          playerId: gh.playerId,
          playerName: player.name || player.username,
          category: category?.name || '-',
          showDate: gh.createdAt,
          showtime: showtime?.showTime || '-',
          entries: 0,
          totalAmount: 0,
          winningAmount: 0,
          balance: 0,
          games: [],
        });
      }

      const record = playerMap.get(key);
      record.entries += gh.gameplay.length;
      record.totalAmount += gh.totalBetAmount;

      gh.gameplay.forEach((play) => {
        const gameWinAmount = play.winAmount || 0;
        record.winningAmount += gameWinAmount;
        record.games.push({
          boardName: play.board,
          number: play.numbers,
          qty: play.qty,
          amount: play.amount,
          winningAmount: gameWinAmount,
        });
      });

      record.balance = record.totalAmount - record.winningAmount;
    }

    const playerData = Array.from(playerMap.values()).map((item, index) => ({
      sno: index + 1,
      ...item,
    }));

    return playerData;
  }

  async getPlayerGameDetails(playerId: number, categoryId: number, showtimeId: number, date: string) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const gameHistories = await this.prisma.gameHistory.findMany({
      where: {
        playerId: Number(playerId),
        categoryId: Number(categoryId),
        showtimeId: Number(showtimeId),
        createdAt: { gte: targetDate, lt: nextDate },
      },
      include: {
        gameplay: true,
      },
    });

    const games: any[] = [];
    let sno = 1;

    gameHistories.forEach((gh) => {
      gh.gameplay.forEach((play) => {
        games.push({
          sno: sno++,
          boardName: play.board,
          number: play.numbers,
          qty: play.qty,
          amount: play.amount,
          winningAmount: play.winAmount || 0,
        });
      });
    });

    return games;
  }
}
