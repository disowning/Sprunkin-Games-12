import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// 获取所有域名
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const domains = await prisma.domainbinding.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error('获取域名列表失败:', error);
    return NextResponse.json({ error: '获取域名列表失败' }, { status: 500 });
  }
}

// 添加新域名
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    const { domain } = data;

    // 验证域名格式
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: '域名格式无效' }, { status: 400 });
    }

    // 检查域名是否已存在
    const existingDomain = await prisma.domainbinding.findUnique({
      where: { domain }
    });

    if (existingDomain) {
      return NextResponse.json({ error: '域名已存在' }, { status: 409 });
    }

    // 创建新域名
    const newDomain = await prisma.domainbinding.create({
      data: {
        id: uuidv4(),
        domain,
        isActive: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(newDomain);
  } catch (error) {
    console.error('添加域名失败:', error);
    return NextResponse.json({ error: '添加域名失败' }, { status: 500 });
  }
} 