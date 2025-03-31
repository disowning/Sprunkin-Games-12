import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 验证管理员权限
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }
    
    const requestData = await request.json();
    
    // 验证请求数据
    if (!requestData.homeTitle || !requestData.homeDescription || !requestData.gamePlayingTitleTemplate) {
      return NextResponse.json({ message: '缺少必要字段' }, { status: 400 });
    }
    
    // 获取当前配置
    const existingConfig = await prisma.sitesettings.findFirst({
      where: {
        key: 'seoSettings'
      }
    });
    
    // 准备要保存的SEO配置数据
    const seoConfigData = {
      homeTitle: requestData.homeTitle,
      homeDescription: requestData.homeDescription,
      gamePlayingTitleTemplate: requestData.gamePlayingTitleTemplate
    };
    
    let updatedConfig;
    
    if (existingConfig) {
      // 更新现有配置
      updatedConfig = await prisma.sitesettings.update({
        where: {
          id: existingConfig.id
        },
        data: {
          value: JSON.stringify(seoConfigData),
          updatedAt: new Date()
        }
      });
    } else {
      // 创建新配置
      updatedConfig = await prisma.sitesettings.create({
        data: {
          id: uuidv4(),
          key: 'seoSettings',
          value: JSON.stringify(seoConfigData),
          updatedAt: new Date()
        }
      });
    }
    
    // 返回更新后的配置，解析JSON以便客户端使用
    return NextResponse.json({ 
      success: true, 
      data: {
        id: updatedConfig.id,
        ...seoConfigData
      } 
    });
  } catch (error: any) {
    console.error('SEO配置更新失败:', error);
    return NextResponse.json({ message: '处理请求时出错' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // 获取SEO设置
    const seoSettings = await prisma.sitesettings.findFirst({
      where: {
        key: 'seoSettings'
      }
    });

    if (!seoSettings) {
      return NextResponse.json({});
    }

    return NextResponse.json(JSON.parse(seoSettings.value));
  } catch (error: any) {
    console.error('获取SEO配置失败:', error);
    return NextResponse.json({ message: '处理请求时出错' }, { status: 500 });
  }
}