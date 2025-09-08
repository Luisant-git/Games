import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PlayGameDto } from './dto/play-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }

  @Put(':id/toggle-active')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.toggleActive(id);
  }

  @Post('play')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  playGame(@Request() req, @Body() playGameDto: PlayGameDto) {
    const playerId = req.user.userId || req.user.id || req.user.sub;
    return this.gamesService.playGame(playerId, playGameDto);
  }

  @Get('history/player')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getPlayerHistory(@Request() req) {
    const playerId = req.user.userId || req.user.id || req.user.sub;
    return this.gamesService.getPlayerHistory(playerId);
  }
}