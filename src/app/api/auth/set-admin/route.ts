import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: '设置管理员失败' }, { status: 500 })
  }
} 