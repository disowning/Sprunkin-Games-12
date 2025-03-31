import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// 获取导航项列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    const items = await prisma.navitem.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      items
    })
  } catch (error) {
    console.error('获取导航项失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取导航项失败'
    }, { status: 500 })
  }
}

// 创建新导航项
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    const { title, path } = await request.json()

    if (!title || !path) {
      return NextResponse.json({
        success: false,
        message: '标题和路径不能为空'
      }, { status: 400 })
    }

    // 获取当前最大的 order 值
    const maxOrder = await prisma.navitem.findFirst({
      orderBy: {
        order: 'desc'
      },
      select: {
        order: true
      }
    })

    const newOrder = (maxOrder?.order || 0) + 1

    const item = await prisma.navitem.create({
      data: {
        id: uuidv4(),
        title,
        path,
        order: newOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      item
    })
  } catch (error) {
    console.error('创建导航项失败:', error)
    return NextResponse.json({
      success: false,
      message: '创建导航项失败'
    }, { status: 500 })
  }
}

// 更新导航项
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    const { id, title, path, order, isActive } = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        message: '导航项ID不能为空'
      }, { status: 400 })
    }

    const updates: any = {
      updatedAt: new Date()
    }

    if (title !== undefined) updates.title = title
    if (path !== undefined) updates.path = path
    if (order !== undefined) updates.order = order
    if (isActive !== undefined) updates.isActive = isActive

    const item = await prisma.navitem.update({
      where: { id },
      data: updates
    })

    return NextResponse.json({
      success: true,
      item
    })
  } catch (error) {
    console.error('更新导航项失败:', error)
    return NextResponse.json({
      success: false,
      message: '更新导航项失败'
    }, { status: 500 })
  }
}

// 删除导航项
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        message: '导航项ID不能为空'
      }, { status: 400 })
    }

    await prisma.navitem.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '导航项删除成功'
    })
  } catch (error) {
    console.error('删除导航项失败:', error)
    return NextResponse.json({
      success: false,
      message: '删除导航项失败'
    }, { status: 500 })
  }
} 