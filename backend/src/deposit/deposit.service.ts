import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { DepositStatus } from './entities/deposit.entity';

@Injectable()
export class DepositService {
  constructor(private prisma: PrismaService) {}

  async create(createDepositDto: CreateDepositDto, playerId: number) {
    const deposit = await this.prisma.deposit.create({
      data: {
        ...createDepositDto,
        playerId,
        status: DepositStatus.PENDING,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Deposit created successfully',
      data: deposit,
    };
  }

  async findAll() {
    const deposits = await this.prisma.deposit.findMany({
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Deposits retrieved successfully',
      data: deposits,
    };
  }

  async findOne(id: number) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException(`Deposit with ID ${id} not found`);
    }

    return deposit;
  }

  async findByPlayer(playerId: number) {
    const deposits = await this.prisma.deposit.findMany({
      where: { playerId },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Deposits retrieved successfully',
      data: deposits,
    };
  }

  async update(id: number, updateDepositDto: UpdateDepositDto) {
    const deposit = await this.findOne(id);
    
    return this.prisma.deposit.update({
      where: { id },
      data: updateDepositDto,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, updateDepositStatusDto: UpdateDepositStatusDto) {
    const deposit = await this.findOne(id);

    const updateData: any = { status: updateDepositStatusDto.status as any };
    if (updateDepositStatusDto.ticket !== undefined) {
      updateData.ticket = updateDepositStatusDto.ticket;
    }

    const updatedDeposit = await this.prisma.deposit.update({
      where: { id },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Add ticket to player wallet when status changes to COMPLETED
    if (updateDepositStatusDto.status === 'COMPLETED' && updateDepositStatusDto.ticket && updateDepositStatusDto.ticket > 0) {
      await this.prisma.playerWallet.update({
        where: { playerId: deposit.playerId },
        data: {
          balance: {
            increment: updateDepositStatusDto.ticket,
          },
        },
      });
    }

    return {
      success: true,
      message: 'Deposit status updated successfully',
      data: updatedDeposit,
    };
  }

  async remove(id: number) {
    const deposit = await this.findOne(id);
    
    return this.prisma.deposit.delete({
      where: { id },
    });
  }
}
