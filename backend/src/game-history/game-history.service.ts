import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GameHistoryFilterDto } from './dto/game-history-filter.dto';

@Injectable()
export class GameHistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filterDto: GameHistoryFilterDto) {
    const { board, quantity, page = 1, limit = 10 } = filterDto;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    // Get all game histories first, then filter aggregated results
    const allGameHistories = await this.prisma.gameHistory.findMany({
      include: {
        player: {
          select: {
            id: true,
            username: true,
            phone: true
          }
        },
        gameplay: {
          select: {
            id: true,
            board: true,
            betType: true,
            numbers: true,
            qty: true,
            amount: true,
            winAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by player and aggregate data
    const playerStats = new Map();
    
    allGameHistories.forEach(gameHistory => {
      const playerId = gameHistory.playerId;
      
      if (!playerStats.has(playerId)) {
        playerStats.set(playerId, {
          player: gameHistory.player,
          totalSessions: 0,
          totalBetAmount: 0,
          totalWinAmount: 0,
          totalGames: 0,
          gameplay: [],
          lastPlayed: gameHistory.createdAt
        });
      }
      
      const stats = playerStats.get(playerId);
      stats.totalSessions += 1;
      stats.totalBetAmount += gameHistory.totalBetAmount;
      stats.totalWinAmount += gameHistory.totalWinAmount;
      stats.totalGames += gameHistory.gameplay.length;
      stats.gameplay.push(...gameHistory.gameplay);
      
      if (gameHistory.createdAt > stats.lastPlayed) {
        stats.lastPlayed = gameHistory.createdAt;
      }
    });

    // Convert to array and apply additional filters on aggregated data
    let playerStatsArray = Array.from(playerStats.values());
    
    // Apply filters on aggregated data
    playerStatsArray = playerStatsArray.map(stats => {
      let filteredGameplay = stats.gameplay;
      
      if (board) {
        filteredGameplay = filteredGameplay.filter(game => 
          game.board.toLowerCase() === board.toLowerCase()
        );
      }
      
      if (quantity) {
        filteredGameplay = filteredGameplay.filter(game => 
          game.qty >= Number(quantity)
        );
      }
      
      return {
        ...stats,
        gameplay: filteredGameplay
      };
    }).filter(stats => stats.gameplay.length > 0);

    const total = playerStatsArray.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedData = playerStatsArray.slice(skip, skip + limitNum);

    return {
      success: true,
      data: paginatedData.map(stats => ({
        player: stats.player,
        totalSessions: stats.totalSessions,
        totalBetAmount: stats.totalBetAmount,
        totalWinAmount: stats.totalWinAmount,
        totalGames: stats.totalGames,
        lastPlayed: stats.lastPlayed,
        gameplay: stats.gameplay
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
}