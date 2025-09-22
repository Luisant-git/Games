import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { UpdateWithdrawStatusDto } from './dto/update-withdraw-status.dto';
import { WithdrawStatus } from './entities/withdraw.entity';
import { WithdrawValidation } from './withdraw.validation';

@Injectable()
export class WithdrawService {
  constructor(private prisma: PrismaService) {}

  async create(createWithdrawDto: CreateWithdrawDto, userId: number, userType: string = 'player') {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    WithdrawValidation.validateTransferDetails(createWithdrawDto.transferType, createWithdrawDto.transferDetails);

    // Check if user has sufficient balance
    let userWallet;
    if (userType === 'agent') {
      userWallet = await this.prisma.agentWallet.findUnique({
        where: { agentId: userId },
      });
    } else {
      userWallet = await this.prisma.playerWallet.findUnique({
        where: { playerId: userId },
      });
    }

    if (!userWallet || userWallet.balance < createWithdrawDto.amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    const withdrawData: any = {
      ...createWithdrawDto,
      status: WithdrawStatus.PENDING,
    };

    if (userType === 'agent') {
      withdrawData.agentId = userId;
    } else {
      withdrawData.playerId = userId;
    }

    const withdraw = await this.prisma.withdraw.create({
      data: withdrawData,
      include: {
        player: userType === 'player' ? {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        } : undefined,
        agent: userType === 'agent' ? {
          select: {
            id: true,
            username: true,
            name: true,
          },
        } : undefined,
      },
    });

    return {
      success: true,
      message: 'Withdraw request created successfully',
      data: withdraw,
    };
  }

  async findAll() {
    const withdraws = await this.prisma.withdraw.findMany({
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Withdraws retrieved successfully',
      data: withdraws,
    };
  }

  async findOne(id: number) {
    const withdraw = await this.prisma.withdraw.findUnique({
      where: { id },
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!withdraw) {
      throw new NotFoundException(`Withdraw with ID ${id} not found`);
    }

    return withdraw;
  }

  async findByPlayer(playerId: number) {
    const withdraws = await this.prisma.withdraw.findMany({
      where: { playerId },
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Withdraws retrieved successfully',
      data: withdraws,
    };
  }

  async findByAgent(agentId: number) {
    const withdraws = await this.prisma.withdraw.findMany({
      where: { agentId },
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Agent withdraws retrieved successfully',
      data: withdraws,
    };
  }

  async update(id: number, updateWithdrawDto: UpdateWithdrawDto) {
    const withdraw = await this.findOne(id);
    
    if (updateWithdrawDto.transferType && updateWithdrawDto.transferDetails) {
      WithdrawValidation.validateTransferDetails(updateWithdrawDto.transferType, updateWithdrawDto.transferDetails);
    }

    return this.prisma.withdraw.update({
      where: { id },
      data: updateWithdrawDto,
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, updateWithdrawStatusDto: UpdateWithdrawStatusDto) {
    const withdraw = await this.findOne(id);

    const updateData: any = { status: updateWithdrawStatusDto.status as any };
    if (updateWithdrawStatusDto.ticket !== undefined) {
      updateData.ticket = updateWithdrawStatusDto.ticket;
    }

    // Deduct amount from wallet when status changes to COMPLETED
    if (updateWithdrawStatusDto.status === 'COMPLETED') {
      if (withdraw.playerId) {
        const playerWallet = await this.prisma.playerWallet.findUnique({
          where: { playerId: withdraw.playerId },
        });
        
        if (!playerWallet || playerWallet.balance < withdraw.amount) {
          throw new BadRequestException('Insufficient balance to complete withdrawal');
        }

        await this.prisma.playerWallet.update({
          where: { playerId: withdraw.playerId },
          data: {
            balance: {
              decrement: withdraw.amount,
            },
          },
        });
      } else if (withdraw.agentId) {
        const agentWallet = await this.prisma.agentWallet.findUnique({
          where: { agentId: withdraw.agentId },
        });
        
        if (!agentWallet || agentWallet.balance < withdraw.amount) {
          throw new BadRequestException('Insufficient balance to complete withdrawal');
        }

        await this.prisma.agentWallet.update({
          where: { agentId: withdraw.agentId },
          data: {
            balance: {
              decrement: withdraw.amount,
            },
          },
        });
      }
    }

    const updatedWithdraw = await this.prisma.withdraw.update({
      where: { id },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Withdraw status updated successfully',
      data: updatedWithdraw,
    };
  }

  async remove(id: number) {
    const withdraw = await this.findOne(id);
    
    return this.prisma.withdraw.delete({
      where: { id },
    });
  }
}