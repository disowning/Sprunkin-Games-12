import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query) {
      return NextResponse.json({ games: [] });
    }
    
    // 先获取所有游戏
    const allGames = await prisma.game.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        description: true,
      },
    });
    
    // 使用 JavaScript 进行不区分大小写的过滤
    const lowerCaseQuery = query.toLowerCase();
    const filteredGames = allGames.filter(game => 
      game.title.toLowerCase().includes(lowerCaseQuery) || 
      (game.description && game.description.toLowerCase().includes(lowerCaseQuery))
    );
    
    // 按标题排序并限制结果数量
    const sortedGames = filteredGames
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, limit)
      .map(({ id, title, slug, thumbnailUrl }) => ({ id, title, slug, thumbnailUrl })); // 移除 description 减小返回大小
    
    return NextResponse.json({ games: sortedGames });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
} 