import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { UpdateWithdrawStatusDto } from './dto/update-withdraw-status.dto';
import { WithdrawStatus } from './entities/withdraw.entity';
import { WithdrawValidation } from './withdraw.validation';
import { SettingsService } from '../settings/settings.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class WithdrawService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private emailService: EmailService
  ) {}

  async create(createWithdrawDto: CreateWithdrawDto, userId: number, userType: string = 'player') {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Validate withdraw time
    const isTimeValid = await this.settingsService.validateWithdrawTime();
    if (!isTimeValid) {
      throw new BadRequestException('Withdrawals are not allowed at this time');
    }

    // Validate minimum amount
    const isAmountValid = await this.settingsService.validateWithdrawAmount(createWithdrawDto.amount);
    if (!isAmountValid) {
      const settings = await this.settingsService.getSettings();
      throw new BadRequestException(`Minimum withdraw amount is ${settings.minimumWithdrawAmount}`);
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

    // Deduct amount from wallet instantly when withdraw request is created
    if (userType === 'agent') {
      await this.prisma.agentWallet.update({
        where: { agentId: userId },
        data: {
          balance: {
            decrement: createWithdrawDto.amount,
          },
        },
      });
    } else {
      await this.prisma.playerWallet.update({
        where: { playerId: userId },
        data: {
          balance: {
            decrement: createWithdrawDto.amount,
          },
        },
      });
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

    await this.emailService.sendWithdrawNotification(withdraw);

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

    // Generate reference number when status changes to COMPLETED
    if (updateWithdrawStatusDto.status === 'COMPLETED') {
      // Generate unique reference number: WD + timestamp + random 4 digits
      let referenceNumber;
      let isUnique = false;
      
      while (!isUnique) {
        const timestamp = Date.now().toString().slice(-8);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        referenceNumber = `WD${timestamp}${randomNum}`;
        
        // Check if reference number already exists
        const existingWithdraw = await this.prisma.withdraw.findUnique({
          where: { referenceNumber }
        });
        
        if (!existingWithdraw) {
          isUnique = true;
        }
      }
      
      updateData.referenceNumber = referenceNumber;
    }
    
    // Refund amount to wallet if status changes to FAILED or MISMATCH
    if (updateWithdrawStatusDto.status === 'FAILED' || updateWithdrawStatusDto.status === 'MISMATCH') {
      if (withdraw.playerId) {
        await this.prisma.playerWallet.update({
          where: { playerId: withdraw.playerId },
          data: {
            balance: {
              increment: withdraw.amount,
            },
          },
        });
      } else if (withdraw.agentId) {
        await this.prisma.agentWallet.update({
          where: { agentId: withdraw.agentId },
          data: {
            balance: {
              increment: withdraw.amount,
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