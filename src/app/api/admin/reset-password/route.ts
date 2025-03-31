import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 注意：这是一个临时接口，测试后应该删除
    const email = 'admin@jx099.com';
    const newPassword = '123456'; // 设置新密码
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新用户密码
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        role: 'ADMIN'  // 确保是管理员角色
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' }, 
      { status: 500 }
    );
  }
} 