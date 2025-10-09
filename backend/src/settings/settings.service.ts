import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findFirst();
    
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          depositStartTime: "00:00",
          depositEndTime: "23:59",
          withdrawStartTime: "00:00", 
          withdrawEndTime: "23:59",
          minimumDepositAmount: 100,
          minimumWithdrawAmount: 100
        }
      });
    }
    
    return settings;
  }

  async validateDepositTime() {
    const settings = await this.getSettings();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    return currentTime >= settings.depositStartTime && currentTime <= settings.depositEndTime;
  }

  async validateWithdrawTime() {
    const settings = await this.getSettings();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    return currentTime >= settings.withdrawStartTime && currentTime <= settings.withdrawEndTime;
  }

  async validateDepositAmount(amount: number) {
    const settings = await this.getSettings();
    return amount >= settings.minimumDepositAmount;
  }

  async validateWithdrawAmount(amount: number) {
    const settings = await this.getSettings();
    return amount >= settings.minimumWithdrawAmount;
  }

  async updateSettings(data: {
    depositStartTime?: string;
    depositEndTime?: string;
    withdrawStartTime?: string;
    withdrawEndTime?: string;
    minimumDepositAmount?: number;
    minimumWithdrawAmount?: number;
  }) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (data.depositStartTime && !timeRegex.test(data.depositStartTime)) {
      throw new Error("Invalid deposit start time format. Use HH:MM");
    }
    
    if (data.depositEndTime && !timeRegex.test(data.depositEndTime)) {
      throw new Error("Invalid deposit end time format. Use HH:MM");
    }
    
    if (data.withdrawStartTime && !timeRegex.test(data.withdrawStartTime)) {
      throw new Error("Invalid withdraw start time format. Use HH:MM");
    }
    
    if (data.withdrawEndTime && !timeRegex.test(data.withdrawEndTime)) {
      throw new Error("Invalid withdraw end time format. Use HH:MM");
    }

    if (data.minimumDepositAmount && data.minimumDepositAmount < 0) {
      throw new Error("Minimum deposit amount cannot be negative");
    }
    
    if (data.minimumWithdrawAmount && data.minimumWithdrawAmount < 0) {
      throw new Error("Minimum withdraw amount cannot be negative");
    }

    let settings = await this.prisma.settings.findFirst();
    
    if (settings) {
      return await this.prisma.settings.update({
        where: { id: settings.id },
        data
      });
    } else {
      return await this.prisma.settings.create({
        data: {
          depositStartTime: data.depositStartTime || "00:00",
          depositEndTime: data.depositEndTime || "23:59",
          withdrawStartTime: data.withdrawStartTime || "00:00",
          withdrawEndTime: data.withdrawEndTime || "23:59",
          minimumDepositAmount: data.minimumDepositAmount || 100,
          minimumWithdrawAmount: data.minimumWithdrawAmount || 100
        }
      });
    }
  }
}