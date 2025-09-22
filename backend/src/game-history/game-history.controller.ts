import { Controller, Get, Query, Param } from '@nestjs/common';
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

  @Get('history-show-time')
  @ApiOperation({ summary: 'Get row data for game history' })
  @ApiResponse({ status: 200, description: 'Row data retrieved successfully' })
  rowData() {
    return this.gameHistoryService.rowData();
  }

  @Get('agents')
  @ApiOperation({ summary: 'Get all agent game history with filters' })
  @ApiQuery({ name: 'board', required: false, description: 'Filter by board name' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Agent game history retrieved successfully' })
  findAllAgents(@Query() filterDto: { board?: string; page?: number; limit?: number }) {
    return this.gameHistoryService.findAllAgents(filterDto);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get specific agent game history' })
  @ApiQuery({ name: 'board', required: false, description: 'Filter by board name' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Agent game history retrieved successfully' })
  findByAgent(
    @Param('agentId') agentId: string,
    @Query() filterDto: { board?: string; page?: number; limit?: number }
  ) {
    return this.gameHistoryService.findByAgent(+agentId, filterDto);
  }

  @Get('today/:showTime')
  @ApiOperation({ summary: 'Get today game history by show time' })
  @ApiResponse({ status: 200, description: 'Today game history by show time retrieved successfully' })
  getTodayGameHistoryByShowTime(@Param('showTime') showTime: string) {
    return this.gameHistoryService.todayGameHistroyByShowTime(showTime);
  }
}