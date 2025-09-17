import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSupportDto } from './dto/create-support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(createSupportDto: CreateSupportDto, userId: number, userType: string) {
    const data = {
      ...createSupportDto,
      ...(userType === 'player' ? { playerId: userId } : { agentId: userId }),
    };

    return this.prisma.support.create({
      data,
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
        agent: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async findByUser(userId: number, userType: string) {
    const where = userType === 'player' ? { playerId: userId } : { agentId: userId };
    
    return this.prisma.support.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
        agent: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }
}