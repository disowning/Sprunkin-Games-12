import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 初始化配置
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 })
    }

    // 初始化配置
    const configs = [
      { key: 'site_title', value: 'Sprunkin Games' },
      { key: 'site_favicon', value: '/favicon.ico' },
      { key: 'logo_name', value: 'Sprunkin' }
    ]

    for (const config of configs) {
      await prisma.siteconfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: {
          key: config.key,
          value: config.value
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: '配置初始化成功'
    })
  } catch (error) {
    console.error('初始化配置失败:', error)
    return NextResponse.json({
      success: false,
      message: '初始化配置失败'
    }, { status: 500 })
  }
} 