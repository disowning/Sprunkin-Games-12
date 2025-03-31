import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await context.params;
    
    const game = await prisma.game.findUnique({
      where: { id: id },
      include: {
        tag: true,
      },
    });

    if (!game) {
      return new NextResponse('Game not found', { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Failed to fetch game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

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
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const gameUrl = formData.get('gameUrl') as string;
    const thumbnail = formData.get('thumbnail') as File | null;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const categoryIds = formData.getAll('categoryIds[]') as string[];
    const tagIds = formData.getAll('tagIds[]') as string[];

    if (!title || !description || !gameUrl) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 验证是否提供了缩略图（文件或URL）
    const hasThumbnailFile = thumbnail && thumbnail.size > 0;
    const hasThumbnailUrl = thumbnailUrl && thumbnailUrl.trim().length > 0;
    
    // 确定要使用的缩略图URL
    let finalThumbnailUrl: string | undefined;

    if (hasThumbnailFile) {
      // 处理文件上传
      const { url } = await put(thumbnail.name, thumbnail, {
        access: 'public',
      });
      finalThumbnailUrl = url;
    } else if (hasThumbnailUrl) {
      // 使用提供的URL
      finalThumbnailUrl = thumbnailUrl;
    }

    const game = await prisma.game.update({
      where: { id: id },
      data: {
        title,
        description,
        gameUrl,
        ...(finalThumbnailUrl && { thumbnailUrl: finalThumbnailUrl }),
        category: categoryIds.length > 0 ? await getCategoryName(categoryIds[0]) : '未分类',
        tag: {
          set: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tag: true,
      },
    });

    revalidatePath('/admin/games');
    revalidatePath('/games');
    revalidatePath(`/games/${game.slug}`);

    return NextResponse.json(game);
  } catch (error) {
    console.error('Failed to update game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await context.params;
    await prisma.game.delete({
      where: { id: id },
    });

    revalidatePath('/admin/games');
    revalidatePath('/games');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 辅助函数，根据 ID 获取分类名称
async function getCategoryName(categoryId: string): Promise<string> {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    return category?.name || '未分类';
  } catch {
    return '未分类';
  }
} 