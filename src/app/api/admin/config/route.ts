import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface SiteConfig {
  id: string
  key: string
  value: string
  createdAt: Date
  updatedAt: Date
}

// 获取配置
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    const configs = await prisma.siteconfig.findMany()
    
    return NextResponse.json({
      success: true,
      configs: configs.reduce((acc: Record<string, string>, curr: SiteConfig) => ({
        ...acc,
        [curr.key]: curr.value
      }), {})
    })
  } catch (error) {
    console.error('获取配置失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取配置失败'
    }, { status: 500 })
  }
}

// 更新配置
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({
        success: false,
        message: '配置键不能为空'
      }, { status: 400 })
    }

    // 先查找是否存在该配置
    const existingConfig = await prisma.siteconfig.findUnique({
      where: { key }
    })

    let config
    if (existingConfig) {
      // 更新现有配置
      config = await prisma.siteconfig.update({
        where: { key },
        data: { 
          value,
          updatedAt: new Date()
        }
      })
    } else {
      // 创建新配置
      config = await prisma.siteconfig.create({
        data: { 
          key, 
          value,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('更新配置失败:', error)
    return NextResponse.json({
      success: false,
      message: '更新配置失败'
    }, { status: 500 })
  }
} 