import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 验证是否为管理员
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 获取基础统计数据
    const [usersCount, gamesCount, gamePlaysCount, visitorCountriesCount] = await Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.gameplay.count(),
      prisma.visitorcountry.count(),
    ])
    
    // 获取过去7个月的数据
    const now = new Date()
    const months: Date[] = []
    const monthLabels: string[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date)
      
      // 格式化为"1月"这样的格式
      monthLabels.push(date.toLocaleDateString('zh-CN', { month: 'long' }).replace('月份', '月'))
    }
    
    // 获取游戏访问量数据（每月游戏的views增量）
    const monthlyViews = await Promise.all(
      months.map(async (startDate, index) => {
        // 计算月结束日期
        const endDate = index < 6 
          ? new Date(months[index + 1].getTime() - 1) 
          : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        
        // 查询该月的游戏游玩记录
        const count = await prisma.gameplay.count({
          where: {
            playedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
        
        return count
      })
    )
    
    // 获取热门游戏数据（按游玩次数排序）
    const topGames = await prisma.game.findMany({
      take: 7,
      orderBy: {
        views: 'desc'
      },
      select: {
        title: true,
        _count: {
          select: {
            gameplay: true
          }
        }
      }
    })
    
    // 处理图表数据
    const gameViewsChart = {
      labels: monthLabels,
      data: monthlyViews,
    }
    
    const popularGamesChart = {
      labels: topGames.map(game => game.title),
      data: topGames.map(game => game._count.gameplay),
    }
    
    // 获取最近7天的每日游玩数据
    const last7Days: Date[] = []
    const dailyLabels: string[] = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      last7Days.push(date)
      
      // 格式化为"1日"这样的格式
      dailyLabels.push(date.toLocaleDateString('zh-CN', { day: 'numeric' }).replace('日', '日'))
    }
    
    const dailyGamePlays = await Promise.all(
      last7Days.map(async (startDate, index) => {
        // 计算日结束时间
        const endDate = new Date(startDate)
        endDate.setHours(23, 59, 59, 999)
        
        // 查询该日的游戏游玩记录
        const count = await prisma.gameplay.count({
          where: {
            playedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        })
        
        return count
      })
    )
    
    // 获取设备类型分布
    const deviceStats = await prisma.gameplay.groupBy({
      by: ['deviceType'],
      _count: {
        id: true
      },
      where: {
        deviceType: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })
    
    // 获取浏览器分布
    const browserStats = await prisma.gameplay.groupBy({
      by: ['browserInfo'],
      _count: {
        id: true
      },
      where: {
        browserInfo: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })
    
    // 最近活跃用户
    const activeUsers = await prisma.gameplay.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      where: {
        userId: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })
    
    // 获取用户信息
    const userIds = activeUsers.map(u => u.userId as string)
    const users = userIds.length > 0 
      ? await prisma.user.findMany({
          where: {
            id: {
              in: userIds
            }
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
      : []
    
    // 构建活跃用户数据
    const activeUsersData = activeUsers.map(u => {
      const user = users.find(user => user.id === u.userId)
      return {
        userId: u.userId,
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        playCount: u._count.id
      }
    })
    
    return NextResponse.json({
      stats: {
        usersCount,
        gamesCount,
        gamePlaysCount,
        visitorCountriesCount
      },
      gameViewsChart,
      popularGamesChart,
      dailyStats: {
        labels: dailyLabels,
        data: dailyGamePlays
      },
      deviceStats: {
        labels: deviceStats.map(d => d.deviceType || 'Unknown'),
        data: deviceStats.map(d => d._count.id)
      },
      browserStats: {
        labels: browserStats.map(b => b.browserInfo || 'Unknown'),
        data: browserStats.map(b => b._count.id)
      },
      activeUsers: activeUsersData
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
} 