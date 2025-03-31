import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const configs = await prisma.siteconfig.findMany();
    
    // 转换为键值对形式
    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json({ configs: configMap });
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 