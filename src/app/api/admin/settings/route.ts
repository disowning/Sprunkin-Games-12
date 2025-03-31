import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// 获取设置
export async function GET() {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取所有设置
    const settings = await prisma.sitesettings.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 更新设置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取请求体
    const body = await request.json();
    console.log('Received settings data:', body); // 调试日志
    
    // 处理单个对象或数组格式
    const settingsToUpdate = Array.isArray(body) ? body : [
      { key: 'siteTitle', value: body.siteTitle || '' },
      { key: 'siteFavicon', value: body.siteFavicon || '' }
    ];
    
    // 逐个更新设置
    const updatedSettings = await Promise.all(
      settingsToUpdate.map(async (setting) => {
        if (!setting.key) {
          console.error('Missing key in setting:', setting);
          return null;
        }
        
        let result;
        const existingSetting = await prisma.sitesettings.findUnique({
          where: { key: setting.key }
        });

        if (existingSetting) {
          // 更新现有设置
          result = await prisma.sitesettings.update({
            where: { id: existingSetting.id },
            data: {
              value: setting.value,
              updatedAt: new Date()
            }
          });
        } else {
          // 创建新设置
          result = await prisma.sitesettings.create({
            data: {
              id: uuidv4(),
              key: setting.key,
              value: setting.value || '',
              updatedAt: new Date()
            }
          });
        }

        return result;
      })
    );

    return NextResponse.json({ success: true, data: updatedSettings });
  } catch (error: unknown) {
    console.error('Error updating settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 