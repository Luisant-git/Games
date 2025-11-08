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

    if (filterDto.board) {
      where.board = { contains: filterDto.board, mode: 'insensitive' };
    }

    if (filterDto.qty) {
      where.qty = { gte: Number(filterDto.qty) };
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });



    const groupedData: Record<string, any> = gamePlays.reduce((acc, play) => {
      const key = `${play.board}-${play.numbers}`;
      if (!acc[key]) {
        acc[key] = {
          board: play.board,
          number: play.numbers,
          amount: 0,
          qty: 0,
          totalAmount: 0,
        };
      }
      acc[key].qty += play.qty;
      acc[key].amount += play.amount;
      acc[key].totalAmount += play.amount * play.qty;
      return acc;
    }, {});

    const allData = Object.values(groupedData);
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

  async getWhatsAppFormat(filterDto: OrderReportFilterDto) {
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
      where.board = { contains: filterDto.board, mode: 'insensitive' };
    }

    if (filterDto.qty) {
      where.qty = { gte: Number(filterDto.qty) };
    }

    const gamePlays = await this.prisma.gamePlay.findMany({
      where,
      orderBy: {
        board: 'asc',
      },
    });

    const groupedByBoard: Record<string, any[]> = gamePlays.reduce((acc, play) => {
      if (!acc[play.board]) {
        acc[play.board] = [];
      }
      const existing = acc[play.board].find((item) => item.number === play.numbers);
      if (existing) {
        existing.qty += play.qty;
      } else {
        acc[play.board].push({
          number: play.numbers,
          qty: play.qty,
        });
      }
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

        message += `Category: ${showtime.timing.category.name}\n`;
        message += `Showtime: ${formatTime(showtime.showTime)}\n`;
        message += `Date: ${formatDate(targetDate)}\n\n`;
      }
    }

    Object.entries(groupedByBoard).forEach(([board, items]: [string, any[]]) => {
      items.forEach((item) => {
        message += `${board}\n${item.number} * ${item.qty}\n\n`;
      });
    });

    return { message: message.trim() };
  }
}
