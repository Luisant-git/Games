import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    try {
      const settings = await this.settingsService.getSettings();
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Put()
  async updateSettings(@Body() body: {
    depositStartTime?: string;
    depositEndTime?: string;
    withdrawStartTime?: string;
    withdrawEndTime?: string;
    minimumDepositAmount?: number;
    minimumWithdrawAmount?: number;
  }) {
    try {
      const settings = await this.settingsService.updateSettings(body);
      return {
        success: true,
        message: "Settings updated successfully",
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}