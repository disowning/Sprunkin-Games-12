import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    
    // 构建查询条件
    const whereClause: any = {
      isActive: true,
      // 如果设置了开始日期，则只返回已经开始的广告
      // startDate 为 null 或者 小于等于当前时间
      OR: [
        { startDate: null },
        { startDate: { lte: new Date() } }
      ],
      // 如果设置了结束日期，则只返回尚未结束的广告
      // endDate 为 null 或者 大于当前时间
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gt: new Date() } }
          ]
        }
      ]
    }
    
    // 如果指定了位置，则按位置过滤
    if (location) {
      whereClause.location = location
    }
    
    // 查询符合条件的广告
    const advertisements = await prisma.advertisement.findMany({
      where: whereClause,
      orderBy: {
        order: 'asc'
      },
      take: location ? 1 : 10, // 如果指定了位置，只返回优先级最高的一个广告
    })
    
    return NextResponse.json({ advertisements })
  } catch (error) {
    console.error('获取广告数据失败:', error)
    return NextResponse.json(
      { message: '获取广告数据失败' },
      { status: 500 }
    )
  }
} 