import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
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
}
