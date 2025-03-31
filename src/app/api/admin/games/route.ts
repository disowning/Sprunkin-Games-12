import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

interface GameTag {
  id: string;
  name: string;
}

interface GameWithRelations {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  views: number;
  isSticky: boolean;
  stickyOrder: number;
  stickyUntil: Date | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  tag: GameTag[];
  _count: {
    reviews: number;
    favoritedBy: number;
  };
}

interface GameResponse extends Omit<GameWithRelations, 'tag'> {
  tag: GameTag[];
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // 检查请求内容类型
    const contentType = request.headers.get('content-type') || '';
    
    // 处理FormData格式（包含文件上传）
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // 获取并验证必填字段
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const gameUrl = formData.get('gameUrl') as string || formData.get('downloadUrl') as string;
      const thumbnail = formData.get('thumbnail') as File | null;
      const thumbnailUrl = formData.get('thumbnailUrl') as string;
      const categoryIds = formData.getAll('categoryIds[]') as string[];
      const instructions = formData.get('instructions') as string || '暂无游戏说明';

      // 验证必填字段
      if (!title?.trim()) {
        return new NextResponse('游戏标题不能为空', { status: 400 });
      }

      if (!description?.trim()) {
        return new NextResponse('游戏描述不能为空', { status: 400 });
      }

      if (!gameUrl?.trim()) {
        return new NextResponse('游戏链接不能为空', { status: 400 });
      }

      try {
        new URL(gameUrl);
      } catch {
        return new NextResponse('游戏链接格式无效', { status: 400 });
      }

      // 验证是否提供了缩略图（文件或URL）
      const hasThumbnailFile = thumbnail && thumbnail.size > 0;
      const hasThumbnailUrl = thumbnailUrl && thumbnailUrl.trim().length > 0;
      
      if (!hasThumbnailFile && !hasThumbnailUrl) {
        return new NextResponse('请提供游戏缩略图（上传文件或输入URL）', { status: 400 });
      }
      
      // 如果提供了文件，验证文件类型和大小
      if (hasThumbnailFile) {
        if (!thumbnail.type.startsWith('image/')) {
          return new NextResponse('缩略图必须是图片文件', { status: 400 });
        }

        if (thumbnail.size > 2 * 1024 * 1024) {
          return new NextResponse('缩略图大小不能超过2MB', { status: 400 });
        }
      }
      
      // 在函数内部声明变量
      let thumbnailUrlToUse = '';

      // 如果提供了URL，验证URL格式
      if (hasThumbnailUrl && thumbnailUrl) {
        const trimmedUrl = thumbnailUrl.trim();
        
        // 简化验证逻辑，只验证文件名格式
        if (trimmedUrl.match(/^[a-zA-Z0-9-]+\.(png|jpg|jpeg|gif)$/)) {
          // 直接构建正确的路径
          thumbnailUrlToUse = `/uploads/${trimmedUrl}`;
        } else {
          return new NextResponse('缩略图路径无效，请输入正确的图片文件名', { status: 400 });
        }
      }

      // 如果提供了文件，处理文件上传
      if (hasThumbnailFile && thumbnail) {
        try {
          // 使用 Blob 来处理文件数据
          const blob = new Blob([await thumbnail.arrayBuffer()]);
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);

          const uploadDir = path.join(process.cwd(), 'public/uploads');
          const uniqueId = uuidv4();
          const extension = path.extname(thumbnail.name);
          const fileName = `${uniqueId}${extension}`;
          const filePath = path.join(uploadDir, fileName);

          await writeFile(filePath, buffer);
          thumbnailUrlToUse = `/uploads/${fileName}`;
        } catch (error) {
          console.error('Failed to save thumbnail:', error);
          return new NextResponse('上传缩略图失败', { status: 500 });
        }
      }

      if (!categoryIds.length) {
        return new NextResponse('请至少选择一个分类', { status: 400 });
      }

      // 验证分类ID是否存在
      const categories = await prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
      });

      if (categories.length !== categoryIds.length) {
        return new NextResponse('选择的分类无效', { status: 400 });
      }

      // 验证标签ID（如果有）
      const tagIds = formData.getAll('tagIds[]') as string[];
      if (tagIds.length > 0) {
        const tags = await prisma.tag.findMany({
          where: {
            id: {
              in: tagIds,
            },
          },
        });

        if (tags.length !== tagIds.length) {
          return new NextResponse('选择的标签无效', { status: 400 });
        }
      }

      // 生成slug
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 检查slug是否已存在
      const existingGame = await prisma.game.findUnique({
        where: {
          slug,
        },
      });

      if (existingGame) {
        return new NextResponse('已存在相同标题的游戏', { status: 400 });
      }

      // 创建游戏记录
      const game = await prisma.game.create({
        data: {
          title,
          description,
          thumbnailUrl: thumbnailUrlToUse,
          gameUrl,
          instructions,
          slug,
          category: categoryIds[0] || '未分类', // 使用第一个分类作为主分类
          tag: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
        include: {
          tag: true,
        },
      });

      // 刷新缓存
      revalidatePath('/admin/games');
      revalidatePath('/games');

      return NextResponse.json(game);
    }
    // 处理JSON格式请求
    else {
      const { 
        title, 
        slug: providedSlug,
        description, 
        instructions, 
        thumbnailUrl, 
        gameUrl, 
        categoryIds, 
        tagIds 
      } = await request.json();
      
      // 验证必填字段
      if (!title?.trim()) {
        return NextResponse.json({ message: '游戏标题不能为空' }, { status: 400 });
      }

      if (!description?.trim()) {
        return NextResponse.json({ message: '游戏描述不能为空' }, { status: 400 });
      }

      if (!thumbnailUrl?.trim()) {
        return NextResponse.json({ message: '缩略图路径不能为空' }, { status: 400 });
      }

      if (!gameUrl?.trim()) {
        return NextResponse.json({ message: '游戏链接不能为空' }, { status: 400 });
      }

      // 修改游戏链接验证
      try {
        new URL(gameUrl);
      } catch {
        return NextResponse.json({ message: '游戏链接格式无效' }, { status: 400 });
      }

      // 修改缩略图路径验证
      const trimmedThumbnailUrl = thumbnailUrl.trim();
      let processedThumbnailUrl: string;

      // 简化验证逻辑
      if (trimmedThumbnailUrl.match(/^[a-zA-Z0-9-]+\.(png|jpg|jpeg|gif)$/)) {
        processedThumbnailUrl = `/uploads/${trimmedThumbnailUrl}`;
      } else {
        return NextResponse.json({ 
          message: '请输入正确的图片文件名，例如：example.png' 
        }, { status: 400 });
      }

      if (!categoryIds || !categoryIds.length) {
        return NextResponse.json({ message: '请至少选择一个分类' }, { status: 400 });
      }

      // 验证分类ID是否存在
      const categories = await prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
      });

      if (categories.length !== categoryIds.length) {
        return NextResponse.json({ message: '选择的分类无效' }, { status: 400 });
      }

      // 验证标签ID（如果有）
      if (tagIds && tagIds.length > 0) {
        const tags = await prisma.tag.findMany({
          where: {
            id: {
              in: tagIds,
            },
          },
        });

        if (tags.length !== tagIds.length) {
          return NextResponse.json({ message: '选择的标签无效' }, { status: 400 });
        }
      }

      // 生成或使用提供的slug
      const slug = providedSlug || title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 检查slug是否已存在
      const existingGame = await prisma.game.findUnique({
        where: {
          slug,
        },
      });

      if (existingGame) {
        return NextResponse.json({ message: '已存在相同URL标识的游戏' }, { status: 400 });
      }

      // 创建游戏记录时使用处理好的路径
      const game = await prisma.game.create({
        data: {
          title,
          description,
          thumbnailUrl: processedThumbnailUrl,
          gameUrl,
          instructions: instructions || '暂无游戏说明',
          slug,
          category: categoryIds[0] || '未分类', // 使用第一个分类作为主分类
          tag: {
            connect: (tagIds || []).map((id: string) => ({ id })),
          },
        },
        include: {
          tag: true,
        },
      });

      // 刷新缓存
      revalidatePath('/admin/games');
      revalidatePath('/games');

      return NextResponse.json(game);
    }
  } catch (error) {
    console.error('Failed to create game:', error);
    return new NextResponse(
      error instanceof Error ? error.message : '创建游戏失败，请稍后重试',
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';

    // 验证参数
    if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
      return NextResponse.json({
        success: false,
        message: '分页参数无效'
      }, { status: 400 });
    }

    // 构建查询条件
    const where = search ? {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { slug: { contains: search } }
      ]
    } : {};

    // 计算跳过的记录数
    const skip = (page - 1) * pageSize;

    // 并行获取游戏列表和总数
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [
          { isSticky: 'desc' },
          { stickyOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              gamereview: true,
              user: true,
            },
          },
        },
      }),
      prisma.game.count({ where }),
    ]);

    // 计算是否还有更多数据
    const hasMore = total > skip + games.length;

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    // 转换 tag 字段为 tags 以保持前端兼容性，并重命名计数字段
    const formattedGames = games.map((game: any): GameResponse => {
      const { tag, _count, ...rest } = game;
      return {
        ...rest,
        tag: tag,
        _count: {
          reviews: _count.gamereview,
          favoritedBy: _count.user
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        games: formattedGames,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          pageSize,
          hasMore
        }
      }
    });
  } catch (error) {
    console.error('获取游戏列表失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取游戏列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 检查请求内容类型
    const contentType = request.headers.get('content-type') || '';
    
    // 处理FormData格式（包含文件上传）
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const id = formData.get('id') as string;
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const description = formData.get('description') as string;
      const instructions = formData.get('instructions') as string;
      const gameUrl = formData.get('gameUrl') as string;
      const thumbnail = formData.get('thumbnail') as File;
      const categoryIds = formData.getAll('categoryIds[]') as string[];
      const tagIds = formData.getAll('tagIds[]') as string[];

      // 验证必填字段
      if (!id || !title || !slug || !description || !instructions || !gameUrl) {
        return NextResponse.json(
          { message: '请填写所有必填字段' },
          { status: 400 }
        );
      }

      // 检查 slug 是否已被其他游戏使用
      const existingGame = await prisma.game.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

      if (existingGame) {
        return NextResponse.json(
          { message: 'URL 标识已被使用' },
          { status: 400 }
        );
      }

      let processedThumbnailUrl = '';

      if (thumbnail && thumbnail.size > 0) {
        try {
          const blob = new Blob([await thumbnail.arrayBuffer()]);
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);

          const uploadDir = path.join(process.cwd(), 'public/uploads');
          const uniqueId = uuidv4();
          const extension = path.extname(thumbnail.name);
          const fileName = `${uniqueId}${extension}`;
          const filePath = path.join(uploadDir, fileName);

          await writeFile(filePath, buffer);
          processedThumbnailUrl = `/uploads/${fileName}`;
        } catch (error) {
          console.error('Failed to save thumbnail:', error);
          return new NextResponse('上传缩略图失败', { status: 500 });
        }
      }

      // 更新游戏
      const game = await prisma.game.update({
        where: { id },
        data: {
          title,
          slug,
          description,
          instructions,
          thumbnailUrl: processedThumbnailUrl,
          gameUrl,
          category: categoryIds[0] || '未分类', // 使用第一个分类作为主分类
          tag: {
            set: tagIds.map((id: string) => ({ id })),
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
    } 
    // 处理JSON格式请求
    else {
      const {
        id,
        title,
        slug,
        description,
        instructions,
        thumbnailUrl,
        gameUrl,
        categoryIds,
        tagIds,
      } = await request.json();

      // 验证必填字段
      if (!id || !title || !slug || !description || !instructions || !thumbnailUrl || !gameUrl) {
        return NextResponse.json(
          { message: '请填写所有必填字段' },
          { status: 400 }
        );
      }

      // 检查 slug 是否已被其他游戏使用
      const existingGame = await prisma.game.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

      if (existingGame) {
        return NextResponse.json(
          { message: 'URL 标识已被使用' },
          { status: 400 }
        );
      }

      // 修改缩略图路径验证和处理
      const trimmedThumbnailUrl = thumbnailUrl.trim();
      let processedThumbnailUrl: string;

      // 简化验证逻辑
      if (trimmedThumbnailUrl.match(/^[a-zA-Z0-9-]+\.(png|jpg|jpeg|gif)$/)) {
        processedThumbnailUrl = `/uploads/${trimmedThumbnailUrl}`;
      } else {
        return NextResponse.json({ 
          message: '请输入正确的图片文件名，例如：example.png' 
        }, { status: 400 });
      }

      // 更新游戏
      const game = await prisma.game.update({
        where: { id },
        data: {
          title,
          slug,
          description,
          instructions,
          thumbnailUrl: processedThumbnailUrl,
          gameUrl,
          category: categoryIds[0] || '未分类', // 使用第一个分类作为主分类
          tag: {
            set: tagIds.map((id: string) => ({ id })),
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
    }
  } catch (error) {
    console.error('Failed to update game:', error);
    return new NextResponse('更新游戏失败，请稍后重试', { status: 500 });
  }
}