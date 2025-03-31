import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 设置或取消置顶
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { isSticky, stickyOrder, stickyUntil } = await request.json();

    // 检查游戏是否存在
    const existingGame = await prisma.game.findUnique({
      where: { id: id },
    });

    if (!existingGame) {
      return new NextResponse('Game not found', { status: 404 });
    }

    // 更新游戏的置顶状态
    const updatedGame = await prisma.game.update({
      where: { id: id },
      data: {
        isSticky: isSticky ?? false,
        stickyOrder: isSticky ? (stickyOrder ?? 0) : 0,
        stickyUntil: isSticky && stickyUntil ? new Date(stickyUntil) : null,
      },
    });

    // 重新验证相关页面缓存
    revalidatePath('/');
    revalidatePath('/admin/games');
    revalidatePath('/games');

    return NextResponse.json({
      success: true,
      game: updatedGame,
      message: isSticky ? '游戏已置顶' : '游戏已取消置顶'
    });
  } catch (error) {
    console.error('Failed to update game sticky status:', error);
    return NextResponse.json(
      { success: false, message: '更新置顶状态失败' },
      { status: 500 }
    );
  }
} 