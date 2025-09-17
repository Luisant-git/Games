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
        agent: {
          select: {
            id: true,
            username: true,
            name: true
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

    // Group by user (player or agent) and aggregate data
    const userStats = new Map();
    
    allGameHistories.forEach(gameHistory => {
      const userId = gameHistory.playerId || gameHistory.agentId;
      const userType = gameHistory.playerId ? 'player' : 'agent';
      const user = gameHistory.player || gameHistory.agent;
      const uniqueKey = `${userType}_${userId}`; // Prevent mixing player and agent with same ID
      
      if (!userStats.has(uniqueKey)) {
        userStats.set(uniqueKey, {
          player: userType === 'player' ? user : null,
          agent: userType === 'agent' ? user : null,
          totalSessions: 0,
          totalBetAmount: 0,
          totalWinAmount: 0,
          totalGames: 0,
          gameplay: [],
          lastPlayed: gameHistory.createdAt
        });
      }
      
      const stats = userStats.get(uniqueKey);
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
    let userStatsArray = Array.from(userStats.values());
    
    // Apply filters on aggregated data
    userStatsArray = userStatsArray.map(stats => {
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

    const total = userStatsArray.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedData = userStatsArray.slice(skip, skip + limitNum);

    return {
      success: true,
      data: paginatedData.map(stats => ({
        player: stats.player,
        agent: stats.agent,
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

  async findAllAgents(filterDto: { board?: string; page?: number; limit?: number }) {
    const { board, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      agentId: { not: null },
      ...(board && {
        gameplay: {
          some: {
            board: {
              contains: board,
              mode: 'insensitive' as any
            }
          }
        }
      })
    };

    const [gameHistories, total] = await Promise.all([
      this.prisma.gameHistory.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              username: true,
              name: true
            }
          },
          gameplay: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.gameHistory.count({ where })
    ]);

    return {
      success: true,
      data: gameHistories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByAgent(agentId: number, filterDto: { board?: string; page?: number; limit?: number }) {
    const { board, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      agentId,
      ...(board && {
        gameplay: {
          some: {
            board: {
              contains: board,
              mode: 'insensitive' as any
            }
          }
        }
      })
    };

    const [gameHistories, total] = await Promise.all([
      this.prisma.gameHistory.findMany({
        where,
        include: { gameplay: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.gameHistory.count({ where })
    ]);

    // Get category names for the histories
    const categoryIds = [...new Set(gameHistories.map(h => h.categoryId))];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {});

    return {
      success: true,
      data: gameHistories.map(history => ({
        ...history,
        categoryName: categoryMap[history.categoryId] || 'Unknown'
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}