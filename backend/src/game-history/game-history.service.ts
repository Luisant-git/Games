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

  async rowData(){
    const data = await this.prisma.gameHistory.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group by showTime
    const groupedData = data.reduce((acc, item) => {
      const showTimeKey = item.showTime.toISOString();
      if (!acc[showTimeKey]) {
        acc[showTimeKey] = [];
      }
      acc[showTimeKey].push(item);
      return acc;
    }, {} as Record<string, typeof data>);

    return {
      success: true,
      data: groupedData
    }
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
      playerId: null,
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

  async todayGameHistroyByShowTime(showTime: string) {
    const decodedShowTime = decodeURIComponent(showTime);
    console.log('=== BACKEND TIMEZONE DEBUG ===');
    console.log('Raw showTime parameter:', showTime);
    console.log('Decoded showTime:', decodedShowTime);
    console.log('Server timezone:', process.env.TZ || 'Not set');
    console.log('Server current time:', new Date().toISOString());
    console.log('Server local time:', new Date().toLocaleString());
    
    // Convert showTime to match database format (local timezone)
    const gameHistories = await this.prisma.$queryRaw`
      SELECT gh.*, 
             json_build_object(
               'id', p.id,
               'username', p.username,
               'phone', p.phone
             ) as player,
             json_build_object(
               'id', a.id,
               'username', a.username,
               'name', a.name
             ) as agent
      FROM "GameHistory" gh
      LEFT JOIN "Player" p ON gh."playerId" = p.id
      LEFT JOIN "Agent" a ON gh."agentId" = a.id
      WHERE to_char(gh."showTime" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI:SS') = ${decodedShowTime}
      ORDER BY gh."createdAt" DESC
    ` as any[];
    
    console.log('Found game histories:', gameHistories.length);
    if (gameHistories.length > 0) {
      console.log('Sample showTime from DB:', gameHistories[0].showTime);
    } else {
      const allShowTimes = await this.prisma.$queryRaw`
        SELECT DISTINCT gh."showTime" 
        FROM "GameHistory" gh 
        ORDER BY gh."showTime" DESC 
        LIMIT 10
      ` as any[];
      console.log('Available showTimes in DB:', allShowTimes.map(row => row.showTime));
    }
    
    // Get gameplay for each history
    const enrichedHistories = await Promise.all(
      gameHistories.map(async (history: any) => {
        const gameplay = await this.prisma.gamePlay.findMany({
          where: { gameHistoryId: history.id }
        });
        return { ...history, gameplay };
      })
    );
    
    // Get category names
    const categoryIds = [...new Set(enrichedHistories.map((h: any) => h.categoryId).filter(id => id))] as number[];
    console.log('Category IDs found:', categoryIds);
    
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });
    console.log('Categories fetched:', categories);
    
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<number, string>);
    console.log('Category map:', categoryMap);

    // Group by category and calculate totals
    const categoryTotals = new Map();
    
    enrichedHistories.forEach((history: any) => {
      const categoryId = history.categoryId;
      const categoryName = categoryMap[categoryId] || `Unknown (ID: ${categoryId})`;
      console.log(`History ID: ${history.id}, Category ID: ${categoryId}, Category Name: ${categoryName}`);
      
      if (!categoryTotals.has(categoryId)) {
        categoryTotals.set(categoryId, {
          categoryId,
          categoryName,
          showTime: history.showTime,
          playStart: history.playStart,
          playEnd: history.playEnd,
          totalBetAmount: 0,
          totalAgentCommissionAmount: 0,
          recordCount: 0
        });
      }
      
      const totals = categoryTotals.get(categoryId);
      totals.totalBetAmount += Number(history.totalBetAmount) || 0;
      totals.totalAgentCommissionAmount += Number(history.agentCommission) || 0;
      totals.recordCount += 1;
    });
    
    const summary = Array.from(categoryTotals.values());
    
    // Calculate grand totals
    const grandTotals = {
      totalBetAmount: summary.reduce((sum, cat) => sum + cat.totalBetAmount, 0),
      totalAgentCommissionAmount: summary.reduce((sum, cat) => sum + cat.totalAgentCommissionAmount, 0),
      totalRecords: enrichedHistories.length,
      totalCategories: summary.length
    };
    
    return {
      summary,
      details: enrichedHistories.map((history: any) => ({
        ...history,
        categoryName: categoryMap[history.categoryId] || 'Unknown'
      }))
    };
  }
}