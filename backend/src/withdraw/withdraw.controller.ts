import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { UpdateWithdrawStatusDto } from './dto/update-withdraw-status.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('withdraws')
@Controller('withdraws')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new withdraw request' })
  @ApiResponse({ status: 201, description: 'Withdraw request created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createWithdrawDto: CreateWithdrawDto, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.type === 'agent' ? 'agent' : 'player';
    return this.withdrawService.create(createWithdrawDto, userId, userType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all withdraw requests' })
  @ApiResponse({ status: 200, description: 'Return all withdraw requests.' })
  findAll() {
    return this.withdrawService.findAll();
  }

  @Get('player/:playerId')
  @ApiOperation({ summary: 'Get withdraw requests by player ID' })
  @ApiResponse({ status: 200, description: 'Return withdraw requests for specific player.' })
  findByPlayer(@Param('playerId', ParseIntPipe) playerId: number) {
    return this.withdrawService.findByPlayer(playerId);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get withdraw requests by agent ID' })
  @ApiResponse({ status: 200, description: 'Return withdraw requests for specific agent.' })
  findByAgent(@Param('agentId', ParseIntPipe) agentId: number) {
    return this.withdrawService.findByAgent(agentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a withdraw request by ID' })
  @ApiResponse({ status: 200, description: 'Return the withdraw request.' })
  @ApiResponse({ status: 404, description: 'Withdraw request not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.withdrawService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a withdraw request' })
  @ApiResponse({ status: 200, description: 'Withdraw request updated successfully.' })
  @ApiResponse({ status: 404, description: 'Withdraw request not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateWithdrawDto: UpdateWithdrawDto) {
    return this.withdrawService.update(id, updateWithdrawDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update withdraw request status' })
  @ApiResponse({ status: 200, description: 'Withdraw status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Withdraw request not found.' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() updateWithdrawStatusDto: UpdateWithdrawStatusDto) {
    return this.withdrawService.updateStatus(id, updateWithdrawStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a withdraw request' })
  @ApiResponse({ status: 200, description: 'Withdraw request deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Withdraw request not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.withdrawService.remove(id);
  }
}