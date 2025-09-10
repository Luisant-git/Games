import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSupportDto } from './dto/create-support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(createSupportDto: CreateSupportDto, playerId: number) {
    return this.prisma.support.create({
      data: {
        ...createSupportDto,
        playerId,
      },
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async findByPlayer(playerId: number) {
    return this.prisma.support.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}