import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  async create(createBankAccountDto: CreateBankAccountDto, userId: number, userType: string) {
    try {
      // Validate user type
      if (!['agent', 'player'].includes(userType)) {
        throw new BadRequestException('Invalid user type');
      }

      // Check if account number already exists for this user
      const existingAccount = await this.prisma.bankAccount.findFirst({
        where: {
          accountNumber: createBankAccountDto.accountNumber,
          ...(userType === 'agent' ? { agentId: userId } : { playerId: userId })
        }
      });

      if (existingAccount) {
        throw new BadRequestException('Bank account with this account number already exists');
      }

      // If setting as default, unset other default accounts
      if (createBankAccountDto.isDefault) {
        if (userType === 'agent') {
          await this.prisma.bankAccount.updateMany({
            where: { agentId: userId },
            data: { isDefault: false },
          });
        } else {
          await this.prisma.bankAccount.updateMany({
            where: { playerId: userId },
            data: { isDefault: false },
          });
        }
      }

      const bankAccountData: any = {
        accountNumber: createBankAccountDto.accountNumber,
        ifscCode: createBankAccountDto.ifscCode,
        bankName: createBankAccountDto.bankName,
        accountHolderName: createBankAccountDto.accountHolderName,
        isDefault: createBankAccountDto.isDefault || false,
      };

      if (userType === 'agent') {
        bankAccountData.agentId = userId;
      } else {
        bankAccountData.playerId = userId;
      }

      const bankAccount = await this.prisma.bankAccount.create({
        data: bankAccountData,
      });

      return {
        success: true,
        message: 'Bank account added successfully',
        data: bankAccount,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      
      // Log the actual error for debugging
      console.error('Bank account creation error:', error);
      
      // Handle Prisma specific errors
      if (error.code === 'P2002') {
        throw new BadRequestException('Bank account with this information already exists');
      }
      
      throw new BadRequestException('Failed to add bank account. Please check your input and try again.');
    }
  }

  async findByUser(userId: number, userType: string) {
    const whereClause = userType === 'agent' ? { agentId: userId } : { playerId: userId };
    
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: whereClause,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      message: 'Bank accounts retrieved successfully',
      data: bankAccounts,
    };
  }

  async findOne(id: number, userId: number, userType: string) {
    const whereClause = userType === 'agent' 
      ? { id, agentId: userId } 
      : { id, playerId: userId };

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: whereClause,
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return bankAccount;
  }

  async setDefault(id: number, userId: number, userType: string) {
    // Verify account belongs to user
    await this.findOne(id, userId, userType);

    // Unset all default accounts for user
    if (userType === 'agent') {
      await this.prisma.bankAccount.updateMany({
        where: { agentId: userId },
        data: { isDefault: false },
      });
    } else {
      await this.prisma.bankAccount.updateMany({
        where: { playerId: userId },
        data: { isDefault: false },
      });
    }

    // Set the selected account as default
    const bankAccount = await this.prisma.bankAccount.update({
      where: { id },
      data: { isDefault: true },
    });

    return {
      success: true,
      message: 'Default bank account updated successfully',
      data: bankAccount,
    };
  }

  async remove(id: number, userId: number, userType: string) {
    // Verify account belongs to user
    await this.findOne(id, userId, userType);

    await this.prisma.bankAccount.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Bank account deleted successfully',
    };
  }
}