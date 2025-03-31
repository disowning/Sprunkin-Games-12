import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 验证是否是管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '未授权的操作' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，请上传JPG、PNG、GIF或WEBP格式图片' },
        { status: 400 }
      );
    }

    // 验证文件大小 (限制为2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件过大，请上传2MB以内的图片' },
        { status: 400 }
      );
    }

    // 修改验证URL的逻辑
    if (thumbnailUrl) {
      // 检查是否是本地图库路径
      if (thumbnailUrl.startsWith('uploads/')) {
        // 本地图库路径验证通过
      } else {
        try {
          new URL(thumbnailUrl);
        } catch {
          return NextResponse.json(
            { error: '缩略图URL格式无效' },
            { status: 400 }
          );
        }
      }
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成唯一文件名
    const fileExt = path.extname(file.name).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);

    // 写入文件
    await writeFile(filePath, buffer);

    // 返回访问URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 