import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  // 验证会话
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // 获取所有设置项
    const {
      home_seo_title,
      home_seo_description,
      home_seo_keywords,
      
      game_seo_title,
      game_seo_description,
      
      category_seo_title,
      category_seo_description,
      
      tag_seo_title,
      tag_seo_description,
      
      seo_site_name,
      
      site_verification_google,
      site_verification_baidu,
      site_verification_bing
    } = data;

    // 验证必填字段
    if (!home_seo_title || !home_seo_description || !game_seo_title) {
      return NextResponse.json({ error: '必填字段不能为空' }, { status: 400 });
    }

    // 准备所有配置项的数据
    const configItems = [
      { key: 'home_seo_title', value: home_seo_title },
      { key: 'home_seo_description', value: home_seo_description },
      { key: 'home_seo_keywords', value: home_seo_keywords || '' },
      
      { key: 'game_seo_title', value: game_seo_title },
      { key: 'game_seo_description', value: game_seo_description || '' },
      
      { key: 'category_seo_title', value: category_seo_title || '' },
      { key: 'category_seo_description', value: category_seo_description || '' },
      
      { key: 'tag_seo_title', value: tag_seo_title || '' },
      { key: 'tag_seo_description', value: tag_seo_description || '' },
      
      { key: 'seo_site_name', value: seo_site_name || '斯普伦金游戏平台' },
      
      { key: 'site_verification_google', value: site_verification_google || '' },
      { key: 'site_verification_baidu', value: site_verification_baidu || '' },
      { key: 'site_verification_bing', value: site_verification_bing || '' }
    ];

    // 使用事务进行批量更新
    await prisma.$transaction(
      configItems.map(item => 
        prisma.siteconfig.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { 
            id: uuidv4(),
            key: item.key, 
            value: item.value 
          },
        })
      )
    );

    // 重新验证相关页面
    revalidatePath('/');
    revalidatePath('/games');
    revalidatePath('/games/[slug]');
    revalidatePath('/category/[slug]');
    revalidatePath('/tag/[slug]');
    revalidatePath('/admin/seo');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存SEO设置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function GET() {
  // 验证会话
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const configs = await prisma.siteconfig.findMany({
      where: {
        key: {
          in: [
            'home_seo_title',
            'home_seo_description',
            'home_seo_keywords',
            'game_seo_title',
            'game_seo_description',
            'category_seo_title',
            'category_seo_description',
            'tag_seo_title',
            'tag_seo_description',
            'seo_site_name',
            'site_verification_google',
            'site_verification_baidu',
            'site_verification_bing'
          ]
        }
      }
    });

    // 转换为键值对形式
    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    // 默认值
    return NextResponse.json({
      home_seo_title: configMap.home_seo_title || '精选游戏推荐 - 最新最热门的免费在线游戏 | 斯普伦金',
      home_seo_description: configMap.home_seo_description || '探索我们精心挑选的热门游戏，即刻体验无限乐趣，完全免费！',
      home_seo_keywords: configMap.home_seo_keywords || '在线游戏,免费游戏,HTML5游戏,休闲游戏,益智游戏',
      
      game_seo_title: configMap.game_seo_title || '立即玩 {game_title} - 免费在线游戏 | 斯普伦金',
      game_seo_description: configMap.game_seo_description || '免费在线玩{game_title}，无需下载，即点即玩。{game_title}是一款好玩的{game_category}游戏。',
      
      category_seo_title: configMap.category_seo_title || '{category_name}游戏 - 免费在线{category_name}游戏合集 | 斯普伦金',
      category_seo_description: configMap.category_seo_description || '探索我们精选的{category_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
      
      tag_seo_title: configMap.tag_seo_title || '{tag_name}游戏 - 免费在线{tag_name}游戏合集 | 斯普伦金',
      tag_seo_description: configMap.tag_seo_description || '探索我们精选的{tag_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
      
      seo_site_name: configMap.seo_site_name || '斯普伦金游戏平台',
      
      site_verification_google: configMap.site_verification_google || '',
      site_verification_baidu: configMap.site_verification_baidu || '',
      site_verification_bing: configMap.site_verification_bing || ''
    });
  } catch (error) {
    console.error('获取SEO设置失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 