import { Controller, Get, Post } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getDashboardMetrics() {
    return this.dashboardService.calculateDashboardMetrics();
  }

  @Post('update')
  async updateDashboard() {
    return this.dashboardService.updateDashboard();
  }
}