import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  // 安全检查：仅在开发环境或使用特殊密钥时可用
  const setupKey = request.headers.get('x-admin-setup-key');
  if (process.env.NODE_ENV !== 'development' && 
      setupKey !== process.env.ADMIN_SETUP_KEY) {
    console.log('未授权的管理员重置尝试');
    // 返回401但不提供详细信息，防止信息泄露
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 密码加密
    const hashedPassword = await hash(password, 12);

    // 查找是否已存在此邮箱用户
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    let admin;
    if (existingUser) {
      // 更新现有用户
      admin = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name || existingUser.name,
          role: 'ADMIN'
        }
      });
      console.log(`更新了管理员: ${email}`);
    } else {
      // 创建新管理员
      admin = await prisma.user.create({
        data: {
          email,
          name: name || 'Administrator',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log(`创建了新管理员: ${email}`);
    }

    // 返回成功信息，但不包含敏感数据
    return NextResponse.json({
      success: true,
      message: existingUser ? '管理员账户已更新' : '管理员账户已创建',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error('管理员重置失败:', error);
    return NextResponse.json(
      { success: false, message: '管理员账户重置失败' },
      { status: 500 }
    );
  }
} 