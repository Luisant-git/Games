import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { Deposit } from './entities/deposit.entity';

@ApiTags('deposits')
@Controller('deposits')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new deposit' })
  @ApiResponse({ status: 201, description: 'Deposit created successfully', type: Deposit })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDepositDto: CreateDepositDto, @Request() req) {
    const userType = req.user.type || 'player';
    return this.depositService.create(createDepositDto, req.user.id, userType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deposits' })
  @ApiResponse({ status: 200, description: 'List of all deposits', type: [Deposit] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.depositService.findAll();
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get deposit history for authenticated user' })
  @ApiResponse({ status: 200, description: 'Deposit history found', type: [Deposit] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHistory(@Request() req) {
    const userType = req.user.type || 'player';
    return userType === 'agent' ? 
      this.depositService.findByAgent(req.user.id) : 
      this.depositService.findByPlayer(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deposit by ID' })
  @ApiParam({ name: 'id', description: 'Deposit ID' })
  @ApiResponse({ status: 200, description: 'Deposit found', type: Deposit })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.depositService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deposit' })
  @ApiParam({ name: 'id', description: 'Deposit ID' })
  @ApiResponse({ status: 200, description: 'Deposit updated', type: Deposit })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepositDto: UpdateDepositDto,
  ) {
    return this.depositService.update(id, updateDepositDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update deposit status' })
  @ApiParam({ name: 'id', description: 'Deposit ID' })
  @ApiResponse({ status: 200, description: 'Deposit status updated', type: Deposit })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepositStatusDto: UpdateDepositStatusDto,
  ) {
    return this.depositService.updateStatus(id, updateDepositStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete deposit' })
  @ApiParam({ name: 'id', description: 'Deposit ID' })
  @ApiResponse({ status: 200, description: 'Deposit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.depositService.remove(id);
  }
}
