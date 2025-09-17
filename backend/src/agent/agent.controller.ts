import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all agents' })
  @ApiResponse({ status: 200, description: 'All agents retrieved' })
  async getAllAgents() {
    return this.agentService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get agent profile with wallet and referred players',
  })
  @ApiResponse({ status: 200, description: 'Agent profile retrieved' })
  async getAgentProfile(@Request() req) {
    const agentId = req.user.id;
    if (!agentId) {
      throw new Error('Agent ID not found in token');
    }
    return this.agentService.getAgentProfile(agentId);
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agent wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved' })
  async getWallet(@Request() req) {
    const agentId = req.user.id;
    if (!agentId) {
      throw new Error('Agent ID not found in token');
    }
    return this.agentService.getWallet(agentId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new agent' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Agent registered successfully' })
  async register(
    @Body() body: { name?: string; username: string; password: string },
  ) {
    return this.agentService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Agent login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() body: { username: string; password: string }) {
    return this.agentService.login(body.username, body.password);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle agent active status' })
  @ApiResponse({ status: 200, description: 'Agent status updated' })
  async toggleStatus(@Param('id') id: string) {
    return this.agentService.toggleStatus(+id);
  }

  @Get(':id/commissions')
  @ApiOperation({ summary: 'Get agent commissions for all boards' })
  @ApiResponse({ status: 200, description: 'Agent commissions retrieved' })
  async getAgentCommissions(@Param('id') id: string) {
    return this.agentService.getAgentCommissions(+id);
  }

  @Patch(':agentId/commission/:gameId')
  @ApiOperation({ summary: 'Update agent commission for specific board' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        commissionRate: { type: 'number' },
      },
      required: ['commissionRate'],
    },
  })
  @ApiResponse({ status: 200, description: 'Commission updated' })
  async updateCommission(
    @Param('agentId') agentId: string,
    @Param('gameId') gameId: string,
    @Body() body: { commissionRate: number },
  ) {
    return this.agentService.updateCommission(+agentId, +gameId, body.commissionRate);
  }

  @Post('play')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agent play game' })
  @ApiResponse({ status: 201, description: 'Game played successfully' })
  async playGame(@Request() req, @Body() gameData: any) {
    return this.agentService.playGame(req.user.id, gameData);
  }

  @Get('game-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agent game history' })
  @ApiResponse({ status: 200, description: 'Game history retrieved' })
  async getGameHistory(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.agentService.getAgentGameHistory(req.user.id, page ? +page : 1, limit ? +limit : 10);
  }

  @Patch(':id/toggle-play')
  @ApiOperation({ summary: 'Toggle agent play permission' })
  @ApiResponse({ status: 200, description: 'Play permission updated' })
  async togglePlayPermission(@Param('id') id: string) {
    return this.agentService.togglePlayPermission(+id);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change agent password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string' },
        newPassword: { type: 'string' }
      },
      required: ['currentPassword', 'newPassword']
    }
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    const agentId = req.user.id;
    return this.agentService.changePassword(agentId, body.currentPassword, body.newPassword);
  }
}
