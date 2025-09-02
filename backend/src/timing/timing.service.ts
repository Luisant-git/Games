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
    });
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
    return this.prisma.timing.delete({
      where: { id },
    });
  }
}