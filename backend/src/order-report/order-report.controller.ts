import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OrderReportService } from './order-report.service';
import { OrderReportFilterDto } from './dto/order-report-filter.dto';

@Controller('order-report')
export class OrderReportController {
  constructor(private readonly orderReportService: OrderReportService) {}

  @Get()
  async getOrderReport(@Query() filterDto: OrderReportFilterDto) {
    return this.orderReportService.getOrderReport(filterDto);
  }

  @Get('showtimes')
  async getShowtimes() {
    return this.orderReportService.getShowtimes();
  }

  @Get('whatsapp')
  async getWhatsAppFormat(@Query() filterDto: OrderReportFilterDto, @Query('selectedNumbers') selectedNumbers?: string, @Query('isSelectAll') isSelectAll?: string) {
    return this.orderReportService.getWhatsAppFormat(filterDto, selectedNumbers, isSelectAll === 'true');
  }
}
