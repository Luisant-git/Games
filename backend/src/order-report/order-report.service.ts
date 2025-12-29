import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderReportFilterDto } from './dto/order-report-filter.dto';

@Injectable()
export class OrderReportService {
  constructor(private prisma: PrismaService) {}

  async getOrderReport(filterDto: OrderReportFilterDto) {
    const targetDate = filterDto.date ? new Date(filterDto.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const where: any = {
      createdAt: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    };

    if (filterDto.showtimeId) {
      where.gameHistory = {
        showtimeId: Number(filterDto.showtimeId),
      };
    }

    if (filterDto.boards) {
      const boardTicketPairs = filterDto.boards.split(',');
      const gameIds: number[] = [];
      
      for (const pair of boardTicketPairs) {
        const [board, ticket] = pair.split('|');
        const game = await this.prisma.game.findFirst({
          where: {
            board: { equals: board, mode: 'insensitive' },
            ticket: Number(ticket),
          },
        });
        if (game) {
          gameIds.push(game.id);
        }
      }
      
      if (gameIds.length > 0) {
        where.gameId = { in: gameIds };
      }
    } else if (filterDto.board && filterDto.ticket) {
      const game = await this.prisma.game.findFirst({
        where: {
          board: { equals: filterDto.board, mode: 'insensitive' },
          ticket: Number(filterDto.ticket),
        },
      });
      if (game) {
        where.gameId = game.id;
      }
    } else if (filterDto.board) {
      where.board = { equals: filterDto.board, mode: 'insensitive' };
    }

    if (filterDto.betNumber && filterDto.board !== 'ABC' && filterDto.board !== 'ABCD' && filterDto.board !== 'DABC') {
      where.numbers = { contains: filterDto.betNumber };
    }

    const gamePlays = await this.prisma.gamePlay.findMany({
      where,
      include: {
        gameHistory: {
          select: {
            showtimeId: true,
            showTime: true,
            playStart: true,
            playEnd: true,
            categoryId: true,
            playerId: true,
            agentId: true,
            player: {
              select: {
                username: true,
              },
            },
            agent: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });



    let allData = gamePlays.map(play => ({
      board: play.board,
      number: play.numbers,
      username: play.gameHistory.player?.username || play.gameHistory.agent?.username || 'Unknown',
      amount: play.amount,
      qty: play.qty,
    }));
    
    if (filterDto.qty) {
      allData = allData.filter((item: any) => item.qty >= Number(filterDto.qty));
    }
    
    if (filterDto.betNumber && (filterDto.board === 'ABC' || filterDto.board === 'ABCD' || filterDto.board === 'DABC')) {
      const betNumber = filterDto.betNumber;
      allData = allData.filter((item: any) => {
        try {
          const numbers = JSON.parse(item.number);
          const betDigits = betNumber.split('');
          return betDigits.some(digit => numbers.includes(parseInt(digit)));
        } catch {
          return false;
        }
      });
    }
    const totalAmount = allData.reduce((sum: number, item: any) => sum + item.amount, 0);
    const total = allData.length;
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const skip = (page - 1) * limit;
    
    const data = allData.slice(skip, skip + limit).map((item: any, index) => ({
      sno: skip + index + 1,
      ...item,
    }));

    let metadata: any = null;
    if (filterDto.showtimeId) {
      const showtime = await this.prisma.showTime.findUnique({
        where: { id: Number(filterDto.showtimeId) },
        include: {
          timing: {
            include: {
              category: true,
            },
          },
        },
      });

      if (showtime) {
        metadata = {
          category: showtime.timing.category.name,
          showtime: showtime.showTime,
          date: targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
      }
    }

    return { 
      data, 
      metadata,
      totalAmount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getShowtimes() {
    const showtimes = await this.prisma.showTime.findMany({
      include: {
        timing: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        showTime: 'asc',
      },
    });

    return showtimes.map((st) => ({
      id: st.id,
      showTime: st.showTime,
      category: st.timing.category.name,
    }));
  }

  async getWhatsAppFormat(filterDto: OrderReportFilterDto, selectedNumbers?: string, isSelectAll: boolean = false) {
    const targetDate = filterDto.date ? new Date(filterDto.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const where: any = {
      createdAt: {
        gte: targetDate,
        lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    };

    if (filterDto.showtimeId) {
      where.gameHistory = {
        showtimeId: Number(filterDto.showtimeId),
      };
    }

    if (filterDto.board) {
      where.board = { equals: filterDto.board, mode: 'insensitive' };
    }

    if (filterDto.qty) {
      where.qty = { gte: Number(filterDto.qty) };
    }

    if (filterDto.betNumber && filterDto.board !== 'ABC' && filterDto.board !== 'ABCD' && filterDto.board !== 'DABC') {
      where.numbers = { contains: filterDto.betNumber };
    }

    const gamePlays = await this.prisma.gamePlay.findMany({
      where,
      include: {
        gameHistory: {
          select: {
            playerId: true,
            agentId: true,
            player: {
              select: {
                username: true,
              },
            },
            agent: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        board: 'asc',
      },
    });

    const gamePlayWithTickets = await Promise.all(
      gamePlays.map(async (play) => {
        const game = await this.prisma.game.findUnique({
          where: { id: play.gameId },
          select: { ticket: true },
        });
        return {
          ...play,
          ticket: game?.ticket || 0,
        };
      })
    );

    let allData = gamePlayWithTickets.map((play, index) => ({
      sno: index + 1,
      board: play.board,
      ticket: play.ticket,
      number: play.numbers,
      username: play.gameHistory.player?.username || play.gameHistory.agent?.username || 'Unknown',
      amount: play.amount,
      qty: play.qty,
    }));

    if (selectedNumbers && !isSelectAll) {
      const selectedSNos = selectedNumbers.split(',').map(n => parseInt(n));
      allData = allData.filter((item: any) => selectedSNos.includes(item.sno));
    }

    const groupedByBoardTicket: Record<string, any[]> = allData.reduce((acc, item: any) => {
      const key = `${item.board}-${item.ticket}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        number: item.number,
        qty: item.qty,
        amount: item.amount,
      });
      return acc;
    }, {});

    let message = '';

    if (filterDto.showtimeId) {
      const showtime = await this.prisma.showTime.findUnique({
        where: { id: Number(filterDto.showtimeId) },
        include: {
          timing: {
            include: {
              category: true,
            },
          },
        },
      });

      if (showtime) {
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };

        const formatDate = (date: Date) => {
          const day = date.getDate();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        // message += `Category: ${showtime.timing.category.name}\n`;
        message += `Showtime: ${formatTime(showtime.showTime)}\n`;
        message += `Date: ${formatDate(targetDate)}\n\n`;
      }
    }

    let totalAmount = 0;
    
    Object.entries(groupedByBoardTicket).forEach(([key, items]: [string, any[]]) => {
      const [board, ticket] = key.split('-');
      message += `${board} - ${ticket} rs\n`;
      message += '-'.repeat(20) + '\n';
      
      items.forEach((item) => {
        totalAmount += item.amount;
        let formattedNumber = item.number;
        try {
          const parsed = JSON.parse(item.number);
          if (Array.isArray(parsed)) {
            formattedNumber = parsed.join('');
          }
        } catch {
          formattedNumber = item.number;
        }
        message += `${formattedNumber} x ${item.qty}\n`;
      });
      
      message += '\n';
    });

    if (isSelectAll) {
      message += `\nTotal Amount: ₹${totalAmount}`;
    }

    return { message: message.trim() };
  }
}
