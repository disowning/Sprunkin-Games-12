import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// 将分类名称转换为slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 将空格和下划线替换为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾连字符
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    // 获取所有分类
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // 获取每个分类的游戏计数
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const gamesCount = await prisma.game.count({
          where: {
            category: category.name
          }
        });

        return {
          ...category,
          _count: {
            games: gamesCount
          }
        };
      })
    );

    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { message: '获取分类列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: '分类名称不能为空' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = generateSlug(trimmedName);

    // 检查名称是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: trimmedName },
          { slug: slug },
        ],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: '分类已存在' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        id: crypto.randomUUID(), // 生成随机ID
        name: trimmedName,
        slug: slug,
        updatedAt: new Date(), // 设置更新时间
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { message: '创建分类失败' },
      { status: 500 }
    );
  }
} 