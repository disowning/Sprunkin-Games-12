import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@jx099.com';
const ADMIN_PASSWORD = '123456';
const SECRET_KEY = 'your-secret-key-here'; // 添加一个简单的安全验证

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 简单的安全验证
    if (body.secretKey !== SECRET_KEY) {
      return NextResponse.json({ error: '未授权的访问' }, { status: 401 });
    }

    // 生成加密密码
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 尝试查找现有管理员用户
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    });

    if (existingUser) {
      // 更新现有用户
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
    } else {
      // 创建新管理员用户
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'ADMIN',
          name: 'Administrator'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: '管理员账户已重置'
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: '重置失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 