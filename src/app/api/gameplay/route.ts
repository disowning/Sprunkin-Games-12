import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { startOfDay } from 'date-fns'

// 从IP获取国家信息的函数
async function getLocationFromIP(ipAddress: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,city`)
    
    if (!response.ok) {
      throw new Error(`获取位置信息失败: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        country: data.countryCode,
        countryName: data.country,
        city: data.city
      }
    } else {
      console.error('IP位置查询失败:', data.message)
      return null
    }
  } catch (error) {
    console.error('获取IP位置信息出错:', error)
    return null
  }
}

// 获取设备类型
function getDeviceType(userAgent: string) {
  if (/mobile/i.test(userAgent)) {
    return 'Mobile'
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'Tablet'
  } else {
    return 'Desktop'
  }
}

// 获取浏览器信息
function getBrowserInfo(userAgent: string) {
  if (/chrome/i.test(userAgent)) {
    return 'Chrome'
  } else if (/firefox/i.test(userAgent)) {
    return 'Firefox'
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    return 'Safari'
  } else if (/edge/i.test(userAgent)) {
    return 'Edge'
  } else if (/opera|opr/i.test(userAgent)) {
    return 'Opera'
  } else if (/msie|trident/i.test(userAgent)) {
    return 'Internet Explorer'
  } else {
    return 'Unknown'
  }
}

// 记录游戏游玩
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { gameId, duration, sessionId } = data
    
    // 验证必须字段
    if (!gameId || !sessionId) {
      return NextResponse.json(
        { message: '缺少必要参数' },
        { status: 400 }
      )
    }
    
    // 获取用户（如果已登录）
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // 获取IP地址
    const headersList = headers()
    const ipAddress = 
      headersList.get('x-forwarded-for') || 
      headersList.get('x-real-ip') || 
      '127.0.0.1'
    
    // 获取用户代理
    const userAgent = headersList.get('user-agent') || ''
    
    // 获取设备类型和浏览器信息
    const deviceType = getDeviceType(userAgent)
    const browserInfo = getBrowserInfo(userAgent)
    
    // 从IP获取位置信息
    let country = null
    let city = null
    let countryName = null
    
    try {
      const locationInfo = await getLocationFromIP(ipAddress)
      if (locationInfo) {
        country = locationInfo.country
        city = locationInfo.city
        countryName = locationInfo.countryName
      }
    } catch (error) {
      console.error('获取IP位置信息失败:', error)
    }
    
    // 检查游戏是否存在
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    })
    
    if (!game) {
      return NextResponse.json(
        { message: '游戏不存在' },
        { status: 404 }
      )
    }
    
    // 创建游玩记录
    const gamePlay = await prisma.gameplay.create({
      data: {
        gameId,
        sessionId,
        ipAddress,
        country,
        city,
        deviceType,
        browserInfo,
        // 连接到用户（如果已登录）
        ...(userId ? { userId } : {}),
        // 生成唯一ID
        id: uuidv4()
      }
    })
    
    // 如果存在国家信息，更新国家统计
    if (country) {
      // 查找是否已有该国家的记录
      const existingCountry = await prisma.visitorcountry.findUnique({
        where: {
          countryCode: country
        }
      });

      if (existingCountry) {
        // 更新现有国家记录
        await prisma.visitorcountry.update({
          where: {
            id: existingCountry.id
          },
          data: {
            visits: existingCountry.visits + 1,
            lastVisitAt: new Date()
          }
        });
      } else {
        // 创建新国家记录
        await prisma.visitorcountry.create({
          data: {
            id: uuidv4(),
            countryCode: country,
            countryName: countryName || country,
            visits: 1,
            lastVisitAt: new Date()
          }
        });
      }
    }
    
    return NextResponse.json(
      { message: '游戏游玩记录已保存', id: gamePlay.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('记录游戏游玩数据失败:', error)
    return NextResponse.json(
      { message: '记录游戏游玩数据失败' },
      { status: 500 }
    )
  }
}

// 获取游戏游玩统计信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 验证是否为管理员
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const whereClause: any = {}
    if (gameId) {
      whereClause.gameId = gameId
    }
    
    // 获取游戏游玩记录总数
    const total = await prisma.gameplay.count({
      where: whereClause
    })
    
    // 获取游戏游玩记录
    const gamePlays = await prisma.gameplay.findMany({
      where: whereClause,
      orderBy: {
        playedAt: 'desc'
      },
      skip,
      take: limit,
      include: {
        game: {
          select: {
            title: true,
            slug: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json({
      records: gamePlays,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取游戏游玩记录失败:', error)
    return NextResponse.json(
      { message: '获取游戏游玩记录失败' },
      { status: 500 }
    )
  }
} 