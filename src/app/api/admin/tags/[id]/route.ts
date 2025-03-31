import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 获取单个标签信息
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = params;
    
    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return new NextResponse('Tag not found', { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Failed to fetch tag:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 更新标签
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = params;
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new NextResponse('Invalid tag name', { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // 检查名称或slug是否已被其他标签使用
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: trimmedName },
          { slug: slug }
        ],
        NOT: {
          id: id
        }
      }
    });

    if (existingTag) {
      return new NextResponse('Tag name or slug already exists', { status: 400 });
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        name: trimmedName,
        slug: slug
      }
    });

    // 重新验证标签页面和游戏页面
    revalidatePath('/admin/tags');
    revalidatePath('/games');

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Failed to update tag:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 删除标签
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = params;

    // 先查询标签是否存在
    const tag = await prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      return new NextResponse('Tag not found', { status: 404 });
    }

    // 删除标签（会自动从关联表中删除关系）
    await prisma.tag.delete({
      where: { id }
    });

    // 重新验证相关页面
    revalidatePath('/admin/tags');
    revalidatePath('/games');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 