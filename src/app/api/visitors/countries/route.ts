import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic';

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
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || 'visits'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // 获取访客国家总数
    const total = await prisma.visitorcountry.count()
    
    // 获取访客国家数据
    const countries = await prisma.visitorcountry.findMany({
      orderBy: {
        [sortBy === 'lastVisitAt' ? 'lastVisitAt' :
         sortBy === 'countryName' ? 'countryName' : 'visits']: 
         sortOrder as 'asc' | 'desc'
      },
      skip,
      take: limit
    })
    
    // 获取总访问数
    const totalVisits = await prisma.visitorcountry.aggregate({
      _sum: {
        visits: true
      }
    })
    
    return NextResponse.json({
      countries,
      totalVisits: totalVisits._sum.visits || 0,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取访客国家数据失败:', error)
    return NextResponse.json(
      { message: '获取访客国家数据失败' },
      { status: 500 }
    )
  }
} 