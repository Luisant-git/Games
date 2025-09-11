import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GameHistoryService } from './game-history.service';
import { GameHistoryFilterDto } from './dto/game-history-filter.dto';

@ApiTags('game-history')
@Controller('game-history')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get game history with filters' })
  @ApiQuery({ name: 'board', required: false, description: 'Filter by board name' })
  @ApiQuery({ name: 'quantity', required: false, type: Number, description: 'Filter by quantity' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Game history retrieved successfully' })
  findAll(@Query() filterDto: GameHistoryFilterDto) {
    return this.gameHistoryService.findAll(filterDto);
  }
}