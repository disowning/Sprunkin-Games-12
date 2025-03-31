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
    const [gamesCount, usersCount, gamePlaysCount, visitorCountriesCount] = await Promise.all([
      prisma.game.count(),
      prisma.user.count(),
      prisma.gameplay.count(),
      prisma.visitorcountry.count(),
    ])
    
    // 获取热门游戏TOP 5
    const topGames = await prisma.game.findMany({
      take: 5,
      orderBy: {
        views: 'desc'
      },
      select: {
        title: true,
        views: true,
        _count: {
          select: {
            gameplay: true
          }
        }
      }
    })
    
    // 获取近30天活跃用户数据
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeUsersCount = await prisma.gameplay.groupBy({
      by: ['userId'],
      where: {
        userId: {
          not: null
        },
        playedAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    })
    
    // 获取最新游戏游玩记录
    const latestGamePlays = await prisma.gameplay.findMany({
      take: 5,
      orderBy: {
        playedAt: 'desc'
      },
      include: {
        game: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })
    
    // 统计设备类型分布
    const deviceDistribution = await prisma.gameplay.groupBy({
      by: ['deviceType'],
      _count: true,
      where: {
        deviceType: {
          not: null
        }
      }
    })
    
    // 统计浏览器分布
    const browserDistribution = await prisma.gameplay.groupBy({
      by: ['browserInfo'],
      _count: true,
      where: {
        browserInfo: {
          not: null
        }
      }
    })
    
    return NextResponse.json({
      stats: {
        totalGames: gamesCount,
        totalUsers: usersCount,
        totalGamePlays: gamePlaysCount,
        totalCountries: visitorCountriesCount,
        activeUsers30Days: activeUsersCount.length
      },
      topGames: topGames.map(game => ({
        title: game.title,
        views: game.views,
        plays: game._count.gameplay
      })),
      latestPlays: latestGamePlays.map(play => ({
        gameTitle: play.game.title,
        userName: play.user?.name || '匿名用户',
        playedAt: play.playedAt,
        deviceType: play.deviceType || '未知设备',
        duration: play.duration || 0
      })),
      deviceDistribution: deviceDistribution.map(item => ({
        device: item.deviceType || '未知设备',
        count: item._count
      })),
      browserDistribution: browserDistribution.map(item => ({
        browser: item.browserInfo || '未知浏览器',
        count: item._count
      }))
    })
  } catch (error) {
    console.error('Analytics data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
} 