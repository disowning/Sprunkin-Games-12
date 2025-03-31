import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return Response.json(
      { message: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    // 检查分类是否存在
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return Response.json(
        { message: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查是否有游戏使用此分类
    const gamesWithCategory = await prisma.game.count({
      where: {
        category: category.name
      }
    });

    // 如果分类下有游戏，不允许删除
    if (gamesWithCategory > 0) {
      return Response.json(
        { message: '该分类下有游戏，无法删除' },
        { status: 400 }
      );
    }

    // 删除分类
    await prisma.category.delete({
      where: { id },
    });

    return Response.json(
      { message: '分类已删除' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete category:', error);
    return Response.json(
      { message: '删除分类失败' },
      { status: 500 }
    );
  }
} 