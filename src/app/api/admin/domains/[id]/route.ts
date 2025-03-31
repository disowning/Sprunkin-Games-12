import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 更新域名状态
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedDomain = await prisma.domainbinding.update({
      where: { id },
      data: { isActive: data.isActive },
    });

    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error('Error updating domain:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// 删除域名
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = params;

    // 检查域名是否存在
    const domain = await prisma.domainbinding.findUnique({
      where: { id },
    });

    if (!domain) {
      return NextResponse.json({ error: '域名不存在' }, { status: 404 });
    }

    // 删除域名
    await prisma.domainbinding.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除域名失败:', error);
    return NextResponse.json({ error: '删除域名失败' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // ... 获取域名的逻辑
    return Response.json({ /* 域名数据 */ });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch domain' },
      { status: 500 }
    );
  }
}

// PUT 更新域名状态
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const updatedDomain = await prisma.domainbinding.update({
      where: { id },
      data: { isActive: data.isActive },
    });

    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error('更新域名失败:', error);
    return NextResponse.json({ error: '更新域名失败' }, { status: 500 });
  }
} 