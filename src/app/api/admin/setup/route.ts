import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

// 这应该只能在开发环境中使用或使用特殊密钥保护
export async function POST(request: Request) {
  try {
    // 获取管理员设置密钥
    const setupKey = request.headers.get('x-admin-setup-key');
    
    // 检查密钥是否有效
    if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: '无效的管理员设置密钥' }, { status: 401 });
    }

    const { email, password, name } = await request.json();

    // 验证必填字段
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 检查是否已存在管理员账号
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount > 0) {
      // 检查该邮箱是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }
    }

    // 密码加密
    const hashedPassword = await hash(password, 12);

    // 创建管理员用户
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return NextResponse.json(
      { message: '管理员创建成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建管理员失败:', error);
    return NextResponse.json(
      { error: '创建管理员失败' },
      { status: 500 }
    );
  }
} 