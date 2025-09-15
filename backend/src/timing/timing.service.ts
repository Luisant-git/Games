import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTimingDto } from './dto/create-timing.dto';

@Injectable()
export class TimingService {
  constructor(private prisma: PrismaService) {}

  async create(createTimingDto: CreateTimingDto) {
    const { showTimes, ...timingData } = createTimingDto;
    return this.prisma.timing.create({
      data: {
        ...timingData,
        showTimes: {
          create: showTimes,
        },
      },
      include: {
        showTimes: true,
        category: true,
      },
    });
  }

  async findAll() {
    return this.prisma.timing.findMany({
      include: {
        showTimes: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTodayShowTimes() {
    const today = new Date();
    const timings = await this.prisma.timing.findMany({
      include: {
        showTimes: true,
        category: true,
      },
    });

    return timings.map(timing => ({
      ...timing,
      showTimes: timing.showTimes.map(st => {
        const [showHour, showMinute] = st.showTime.split(':');
        const [playStartHour, playStartMinute] = st.playStart.split(':');
        const [playEndHour, playEndMinute] = st.playEnd.split(':');
        
        const showDateTime = new Date(today);
        showDateTime.setHours(parseInt(showHour), parseInt(showMinute), 0, 0);
        
        const playStartDateTime = new Date(today);
        playStartDateTime.setHours(parseInt(playStartHour), parseInt(playStartMinute), 0, 0);
        
        const playEndDateTime = new Date(today);
        playEndDateTime.setHours(parseInt(playEndHour), parseInt(playEndMinute), 0, 0);
        
        return {
          ...st,
          showDateTime,
          playStartDateTime,
          playEndDateTime
        };
      })
    }));
  }

  async findOne(id: number) {
    return this.prisma.timing.findUnique({
      where: { id },
      include: {
        showTimes: true,
        category: true,
      },
    });
  }

  async update(id: number, updateTimingDto: CreateTimingDto) {
    const { showTimes, ...timingData } = updateTimingDto;
    return this.prisma.timing.update({
      where: { id },
      data: {
        ...timingData,
        showTimes: {
          deleteMany: {},
          create: showTimes,
        },
      },
      include: {
        showTimes: true,
        category: true,
      },
    });
  }

  async remove(id: number) {
    // Delete related ShowTime records first to avoid foreign key constraint violation
    await this.prisma.showTime.deleteMany({
      where: { timingId: id }
    });
    
    return this.prisma.timing.delete({
      where: { id },
    });
  }
}