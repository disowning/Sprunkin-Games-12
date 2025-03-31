import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取单个广告
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    const advertisement = await prisma.advertisement.findUnique({
      where: { id }
    })
    
    if (!advertisement) {
      return NextResponse.json(
        { message: '广告不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(advertisement)
  } catch (error) {
    console.error('获取广告详情失败:', error)
    return NextResponse.json(
      { message: '获取广告详情失败' },
      { status: 500 }
    )
  }
}

// 更新广告
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const { id } = await context.params
    const body = await request.json()
    const { name, location, adType, adCode, isActive, order, startDate, endDate } = body
    
    // 检查广告是否存在
    const existingAd = await prisma.advertisement.findUnique({
      where: { id }
    })
    
    if (!existingAd) {
      return NextResponse.json(
        { message: '广告不存在' },
        { status: 404 }
      )
    }
    
    // 更新广告
    const updatedAdvertisement = await prisma.advertisement.update({
      where: { id },
      data: {
        name: name ?? existingAd.name,
        location: location ?? existingAd.location,
        adType: adType ?? existingAd.adType,
        adCode: adCode ?? existingAd.adCode,
        isActive: isActive !== undefined ? isActive : existingAd.isActive,
        order: order !== undefined ? order : existingAd.order,
        startDate: startDate ? new Date(startDate) : existingAd.startDate,
        endDate: endDate ? new Date(endDate) : existingAd.endDate
      }
    })
    
    return NextResponse.json(updatedAdvertisement)
  } catch (error) {
    console.error('更新广告失败:', error)
    return NextResponse.json(
      { message: '更新广告失败' },
      { status: 500 }
    )
  }
}

// 删除广告
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const { id } = await context.params
    
    // 检查广告是否存在
    const existingAd = await prisma.advertisement.findUnique({
      where: { id }
    })
    
    if (!existingAd) {
      return NextResponse.json(
        { message: '广告不存在' },
        { status: 404 }
      )
    }
    
    // 删除广告
    await prisma.advertisement.delete({
      where: { id }
    })
    
    return NextResponse.json(
      { message: '广告已删除' },
      { status: 200 }
    )
  } catch (error) {
    console.error('删除广告失败:', error)
    return NextResponse.json(
      { message: '删除广告失败' },
      { status: 500 }
    )
  }
} 