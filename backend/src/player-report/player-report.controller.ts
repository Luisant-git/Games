import { Controller, Get, Query } from '@nestjs/common';
import { PlayerReportService } from './player-report.service';
import { PlayerReportFilterDto } from './dto/player-report-filter.dto';

@Controller('player-report')
export class PlayerReportController {
  constructor(private readonly playerReportService: PlayerReportService) {}

  @Get()
  async getPlayerReport(@Query() filterDto: PlayerReportFilterDto) {
    return this.playerReportService.getPlayerReport(filterDto);
  }

  @Get('details')
  async getPlayerGameDetails(
    @Query('playerId') playerId: number,
    @Query('categoryId') categoryId: number,
    @Query('showtimeId') showtimeId: number,
    @Query('date') date: string,
  ) {
    return this.playerReportService.getPlayerGameDetails(playerId, categoryId, showtimeId, date);
  }
}
