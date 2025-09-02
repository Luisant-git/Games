import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Player')
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all players' })
  @ApiResponse({ status: 200, description: 'List of all players' })
  async findAll() {
    return this.playerService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get player profile' })
  @ApiResponse({ status: 200, description: 'Player profile retrieved' })
  async getProfile(@Request() req) {
    const playerId = req.user.id;
    if (!playerId) {
      throw new Error('Player ID not found in token');
    }
    return this.playerService.getPlayerProfile(playerId);
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get player wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved' })
  async getWallet(@Request() req) {
    const playerId = req.user.id;
    if (!playerId) {
      throw new Error('Player ID not found in token');
    }
    return this.playerService.getWallet(playerId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new player' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        referalCode: { type: 'string' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ status: 201, description: 'Player registered successfully' })
  async register(@Body() body: { name?: string; email: string; phone?: string; password: string; referalCode?: string }) {
    return this.playerService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Player login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() body: { email: string; password: string }) {
    return this.playerService.login(body.email, body.password);
  }

  @Post('game-win')
  @ApiOperation({ summary: 'Process game win for player' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        playerId: { type: 'number' },
        amount: { type: 'number' }
      },
      required: ['playerId', 'amount']
    }
  })
  @ApiResponse({ status: 200, description: 'Game win processed successfully' })
  async gameWin(@Body() body: { playerId: number; amount: number }) {
    return this.playerService.gameWin(body.playerId, body.amount);
  }
}