import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { DepositStatus } from './entities/deposit.entity';
import { DepositValidation } from './deposit.validation';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class DepositService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService
  ) {}

  async create(createDepositDto: CreateDepositDto, userId: number, userType: string = 'player') {
    // Validate deposit time
    const isTimeValid = await this.settingsService.validateDepositTime();
    if (!isTimeValid) {
      throw new BadRequestException('Deposits are not allowed at this time');
    }

    // Validate minimum amount
    const isAmountValid = await this.settingsService.validateDepositAmount(createDepositDto.amount);
    if (!isAmountValid) {
      const settings = await this.settingsService.getSettings();
      throw new BadRequestException(`Minimum deposit amount is ${settings.minimumDepositAmount}`);
    }

    DepositValidation.validateTransferDetails(createDepositDto.transferType, createDepositDto.transferDetails);

    const depositData: any = {
      ...createDepositDto,
      status: DepositStatus.PENDING,
    };

    if (userType === 'agent') {
      depositData.agentId = userId;
    } else {
      depositData.playerId = userId;
    }

    const deposit = await this.prisma.deposit.create({
      data: depositData,
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
            username: true,
            phone: true,
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
      message: 'Deposits retrieved successfully',
      data: deposits,
    };
  }

  async findByAgent(agentId: number) {
    const deposits = await this.prisma.deposit.findMany({
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
      message: 'Agent deposits retrieved successfully',
      data: deposits,
    };
  }

  async update(id: number, updateDepositDto: UpdateDepositDto) {
    const deposit = await this.findOne(id);
    
    if (updateDepositDto.transferType && updateDepositDto.transferDetails) {
      DepositValidation.validateTransferDetails(updateDepositDto.transferType, updateDepositDto.transferDetails);
    }

    return this.prisma.deposit.update({
      where: { id },
      data: updateDepositDto,
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true,
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
            username: true,
            phone: true,
          },
        },
      },
    });

    // Add ticket to wallet when status changes to COMPLETED
    if (updateDepositStatusDto.status === 'COMPLETED' && updateDepositStatusDto.ticket && updateDepositStatusDto.ticket > 0) {
      if (deposit.playerId) {
        await this.prisma.playerWallet.update({
          where: { playerId: deposit.playerId },
          data: {
            balance: {
              increment: updateDepositStatusDto.ticket,
            },
          },
        });
      } else if (deposit.agentId) {
        await this.prisma.agentWallet.update({
          where: { agentId: deposit.agentId },
          data: {
            balance: {
              increment: updateDepositStatusDto.ticket,
            },
          },
        });
      }
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
