import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: '请提供有效的邮箱地址' }, { status: 400 });
    }
    
    // 检查邮箱是否已订阅
    const existingSubscription = await prisma.subscription.findUnique({
      where: { email }
    });
    
    if (existingSubscription) {
      return NextResponse.json({ message: '该邮箱已订阅' }, { status: 200 });
    }
    
    // 保存新订阅
    await prisma.subscription.create({
      data: { 
        email,
        id: uuidv4(),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true, message: '订阅成功！' });
  } catch (error) {
    console.error('订阅处理失败:', error);
    return NextResponse.json({ error: '订阅处理失败，请稍后重试' }, { status: 500 });
  }
} 