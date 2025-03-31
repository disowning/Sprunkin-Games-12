import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { parse } from 'papaparse';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GameRow {
  title: string;
  description: string;
  thumbnailurl: string;
  gameurl: string;
  instructions?: string;
  categories?: string;
  tags?: string;
  slug?: string;
}

interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

async function processImagePath(thumbnailUrl: string): Promise<ProcessedImage> {
  try {
    // 如果是完整的URL，验证URL是否可访问
    if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
      try {
        const response = await fetch(thumbnailUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`无法访问图片URL: ${thumbnailUrl}`);
        }
        return {
          url: thumbnailUrl,
          width: 0,
          height: 0,
          size: 0,
          format: path.extname(new URL(thumbnailUrl).pathname).slice(1) || 'unknown'
        };
      } catch (error) {
        throw new Error(`验证图片URL失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    // 处理本地文件
    const filename = thumbnailUrl.replace(/^uploads[\/\\]?/, '').trim();

    // 更新验证规则，支持更多特殊字符和中文
    const validFilePattern = /^[\w\s\u4e00-\u9fa5_'×+!&.()-]+\.(png|jpg|jpeg|gif|webp)$/i;

    if (!validFilePattern.test(filename)) {
      throw new Error(
        `图片文件名格式无效: ${filename}\n` +
        '允许使用:\n' +
        '- 字母、数字、空格\n' +
        '- 下划线、连字符、点号\n' +
        '- 中文字符\n' +
        '- 常见符号 (_\'×+!&.-)\n' +
        '支持的格式: PNG, JPG, JPEG, GIF, WEBP\n' +
        '示例: My游戏-2.0.png'
      );
    }

    // 检查文件是否存在（不区分大小写）
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    try {
      // 读取目录内容
      const files = await fs.readdir(uploadsDir);
      
      // 查找匹配的文件（不区分大小写）
      const matchingFile = files.find(file => 
        file.toLowerCase() === filename.toLowerCase()
      );

      if (!matchingFile) {
        throw new Error(
          `图片文件不存在: ${filename}\n` +
          '请确保:\n' +
          '1. 文件已上传到 public/uploads 目录\n' +
          '2. 文件名大小写正确\n' +
          '3. 路径中不包含特殊字符\n\n' +
          '可用的文件列表:\n' +
          files.join('\n')
        );
      }

      const filePath = path.join(uploadsDir, matchingFile);
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        throw new Error('不是有效的文件');
      }

      // 获取图片信息
      const sizeInMB = stats.size / (1024 * 1024);
      if (sizeInMB > 5) {
        throw new Error(`图片大小超过限制: ${sizeInMB.toFixed(2)}MB (最大 5MB)`);
      }

      return {
        url: `/uploads/${matchingFile}`,  // 使用实际找到的文件名
        width: 0,
        height: 0,
        size: stats.size,
        format: path.extname(matchingFile).slice(1)
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`检查图片文件时出错: ${error}`);
    }
  } catch (error) {
    throw new Error(`处理图片失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

async function findOrCreateCategory(categoryName: string): Promise<string> {
  if (!categoryName.trim()) {
    return '未分类';
  }

  const name = categoryName.trim();
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    // 尝试查找现有分类
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return existingCategory.name;
    }

    // 如果分类不存在，创建新分类
    const newCategory = await prisma.category.create({
      data: {
        id: uuidv4(),
        name,
        slug,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`创建新分类: ${newCategory.name} (${newCategory.slug})`);
    return newCategory.name;
  } catch (error) {
    console.error('处理分类时出错:', error);
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log(`分类已存在，尝试重新获取: ${name}`);
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { name },
            { slug }
          ]
        }
      });
      return category?.name || '未分类';
    }
    return '未分类';
  }
}

async function findOrCreateTags(tagNames: string[]): Promise<string[]> {
  try {
    const uniqueTagNames = Array.from(new Set(tagNames.map(name => name.trim()))).filter(Boolean);
    if (uniqueTagNames.length === 0) {
      return [];
    }

    // 查找现有标签
    const existingTags = await prisma.tag.findMany({
      where: {
        OR: uniqueTagNames.map(name => ({
          OR: [
            { name },
            { slug: name.toLowerCase()
                .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '') 
            }
          ]
        }))
      }
    });

    // 找出需要创建的新标签
    const existingTagNames = new Set(existingTags.map((tag: Tag) => tag.name.toLowerCase()));
    const newTagNames = uniqueTagNames.filter(
      name => !existingTagNames.has(name.toLowerCase())
    );

    // 创建新标签
    if (newTagNames.length > 0) {
      const newTags = await prisma.tag.createMany({
        data: newTagNames.map(name => ({
          id: uuidv4(),
          name,
          slug: name.toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, ''),
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        skipDuplicates: true
      });

      console.log(`创建了 ${newTags.count} 个新标签`);
    }

    // 重新获取所有标签（包括新创建的）
    const allTags = await prisma.tag.findMany({
      where: {
        OR: uniqueTagNames.map(name => ({
          OR: [
            { name },
            { slug: name.toLowerCase()
                .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '') 
            }
          ]
        }))
      }
    });

    return allTags.map((tag: Tag) => tag.id);
  } catch (error) {
    console.error('处理标签时出错:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: '未授权访问'
      }, { status: 401 });
    }

    // 获取上传的文件
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: '请上传CSV文件'
      }, { status: 400 });
    }

    // 检查文件类型和大小
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        message: '请上传CSV格式的文件'
      }, { status: 400 });
    }

    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
      return NextResponse.json({
        success: false,
        message: `文件大小超过限制: ${fileSizeInMB.toFixed(2)}MB (最大 10MB)`
      }, { status: 400 });
    }

    // 读取文件内容
    const fileContent = await file.text();
    
    // 解析CSV文件
    const { data, errors } = parse<GameRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const transformed = header.trim().toLowerCase();
        console.log(`转换字段名: "${header}" -> "${transformed}"`);
        return transformed;
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: '解析CSV文件时出错', 
        errors: errors.map(err => ({
          row: err.row,
          code: err.code,
          message: err.message
        }))
      }, { status: 400 });
    }

    // 验证数据结构
    if (data.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'CSV文件不包含有效数据' 
      }, { status: 400 });
    }

    // 检查必要字段
    const requiredFields = ['title', 'description', 'thumbnailurl', 'gameurl'];
    const firstRow = data[0];
    
    console.log('CSV 头部字段:', Object.keys(firstRow));
    console.log('第一行数据:', firstRow);
    
    const missingFields = requiredFields.filter(field => {
      const hasField = Object.keys(firstRow).some(key => key.toLowerCase() === field.toLowerCase());
      console.log(`检查字段 ${field}: ${hasField ? '存在' : '不存在'}`);
      return !hasField;
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `CSV文件缺少必要字段: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // 处理结果统计
    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
      warnings: [] as { row: number; message: string }[]
    };

    // 逐条处理游戏数据
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // 基本验证
        if (!row.title?.trim()) {
          throw new Error('游戏标题不能为空');
        }
        if (!row.description?.trim()) {
          throw new Error('游戏描述不能为空');
        }
        if (!row.thumbnailurl?.trim()) {
          throw new Error('缩略图不能为空');
        }
        if (!row.gameurl?.trim()) {
          throw new Error('游戏链接不能为空');
        }

        // 处理缩略图
        let thumbnailInfo;
        try {
          thumbnailInfo = await processImagePath(row.thumbnailurl.trim());
        } catch (error) {
          throw new Error(`缩略图处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }

        // 处理分类
        let category = '未分类';
        if (row.categories) {
          const categoryNames = row.categories.split(',').map(name => name.trim());
          if (categoryNames.length > 0) {
            category = await findOrCreateCategory(categoryNames[0]);
            if (categoryNames.length > 1) {
              results.warnings.push({
                row: i + 1,
                message: `只使用了第一个分类 "${categoryNames[0]}"，忽略了其他分类`
              });
            }
          }
        }

        // 处理标签
        let tagIds: string[] = [];
        if (row.tags) {
          const tagNames = row.tags.split(',').map(name => name.trim());
          if (tagNames.length > 0) {
            tagIds = await findOrCreateTags(tagNames);
            if (tagIds.length < tagNames.length) {
              results.warnings.push({
                row: i + 1,
                message: `部分标签创建失败，成功创建 ${tagIds.length}/${tagNames.length} 个标签`
              });
            }
          }
        }

        // 生成和验证 slug
        const slug = row.slug?.trim() || row.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // 检查 slug 是否已存在
        const existingGame = await prisma.game.findUnique({
          where: { slug }
        });

        if (existingGame) {
          throw new Error(`已存在相同URL标识(slug)的游戏: ${slug}`);
        }

        // 创建游戏记录
        const game = await prisma.game.create({
          data: {
            id: uuidv4(),
            title: row.title.trim(),
            description: row.description.trim(),
            thumbnailUrl: thumbnailInfo.url,
            gameUrl: row.gameurl.trim(),
            instructions: row.instructions?.trim() || '暂无游戏说明',
            slug,
            category,
            tag: {
              connect: tagIds.map(id => ({ id }))
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        console.log(`成功创建游戏: ${game.title} (${game.slug})`);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    // 重新验证页面缓存
    revalidatePath('/admin/games');
    revalidatePath('/games');

    // 返回处理结果
    return NextResponse.json({
      success: results.failed === 0,
      message: `成功导入 ${results.success} 个游戏，失败 ${results.failed} 个`,
      results: {
        ...results,
        successRate: `${((results.success / results.total) * 100).toFixed(1)}%`
      }
    });

  } catch (error) {
    console.error('导入游戏时出错:', error);
    return NextResponse.json({
      success: false,
      message: '导入游戏时发生错误',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 