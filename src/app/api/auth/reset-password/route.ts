import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: '请输入邮箱地址' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: '该邮箱未注册' },
        { status: 400 }
      );
    }

    // 生成重置令牌
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1小时后过期

    await prisma.verificationtoken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // TODO: 发送重置密码邮件
    // 这里需要集成邮件发送服务，如 SendGrid、Amazon SES 等
    console.log('Reset password link:', `${process.env.NEXTAUTH_URL}/auth/reset-password/${token}`);

    // 验证token
    const storedToken = await prisma.verificationtoken.findFirst({
      where: {
        token,
        identifier: email
      }
    });

    if (!storedToken) {
      return NextResponse.json({ error: '无效的重置链接' }, { status: 400 });
    }

    // 检查token是否过期
    if (new Date() > storedToken.expires) {
      // 删除过期token
      await prisma.verificationtoken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token
          }
        }
      });
      return NextResponse.json({ error: '该链接已过期' }, { status: 400 });
    }

    return NextResponse.json({ message: '重置链接已发送到您的邮箱' });
  } catch (error) {
    console.error('Error in reset password:', error);
    return NextResponse.json(
      { message: '重置密码失败，请稍后重试' },
      { status: 500 }
    );
  }
}