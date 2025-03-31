import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// 获取所有广告
export async function GET() {
  try {
    const ads = await prisma.advertisement.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error('获取广告列表失败:', error)
    return NextResponse.json({ error: '获取广告列表失败' }, { status: 500 })
  }
}

// 创建新广告
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const {
      name,
      location,
      adType,
      adCode,
      isActive = true,
      order = 0,
      startDate,
      endDate
    } = data

    // 验证必填字段
    if (!name || !location || !adType || !adCode) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      )
    }

    // 处理日期
    let parsedStartDate = null
    let parsedEndDate = null

    if (startDate) {
      parsedStartDate = new Date(startDate)
    }

    if (endDate) {
      parsedEndDate = new Date(endDate)
    }

    // 创建新广告
    const newAdvertisement = await prisma.advertisement.create({
      data: {
        id: uuidv4(),
        name,
        location,
        adType,
        adCode,
        isActive,
        order,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(newAdvertisement)
  } catch (error) {
    console.error('创建广告失败:', error)
    return NextResponse.json({ error: '创建广告失败' }, { status: 500 })
  }
} 