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
      where.board = { equals: filterDto.board, mode: 'insensitive' };
    }

    if (filterDto.betNumber && filterDto.board !== 'ABC') {
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
        };
      }
      acc[key].qty += play.qty;
      acc[key].amount += play.amount;
      return acc;
    }, {});

    let allData = Object.values(groupedData);
    
    if (filterDto.qty) {
      allData = allData.filter((item: any) => item.qty >= Number(filterDto.qty));
    }
    
    if (filterDto.betNumber && filterDto.board === 'ABC') {
      const betNumber = filterDto.betNumber;
      allData = allData.filter((item: any) => {
        try {
          const numbers = JSON.parse(item.number);
          const betDigits = betNumber.split('');
          return betDigits.every(digit => numbers.includes(parseInt(digit)));
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

    if (filterDto.betNumber) {
      if (filterDto.board === 'ABC') {
        where.numbers = { contains: filterDto.betNumber };
      } else {
        where.numbers = { contains: filterDto.betNumber };
      }
    }

    const gamePlays = await this.prisma.gamePlay.findMany({
      where,
      orderBy: {
        board: 'asc',
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
        };
      }
      acc[key].qty += play.qty;
      acc[key].amount += play.amount;
      return acc;
    }, {});

    let allData = Object.values(groupedData).map((item: any, index) => ({
      sno: index + 1,
      ...item,
    }));

    if (selectedNumbers) {
      const selectedSNos = selectedNumbers.split(',').map(n => parseInt(n));
      allData = allData.filter((item: any) => selectedSNos.includes(item.sno));
    }

    const groupedByBoard: Record<string, any[]> = allData.reduce((acc, item: any) => {
      if (!acc[item.board]) {
        acc[item.board] = [];
      }
      acc[item.board].push({
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
    Object.entries(groupedByBoard).forEach(([board, items]: [string, any[]]) => {
      items.forEach((item) => {
        totalAmount += item.amount;
        message += `${board}\n${item.number} * ${item.qty}\n\n`;
      });
    });

    if (isSelectAll) {
      message += `\nTotal Amount: ₹${totalAmount}`;
    }

    return { message: message.trim() };
  }
}
