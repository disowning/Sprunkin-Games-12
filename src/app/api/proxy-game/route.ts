import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');
  const token = searchParams.get('token');
  
  if (!gameId || !token) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  
  try {
    // 验证令牌 (简化版，实际应用中需要更安全的验证)
    const tokenParts = token.split('-');
    if (tokenParts[0] !== gameId) {
      return new NextResponse('Invalid Token', { status: 403 });
    }
    
    // 检查令牌是否已过期 (本例设置为30分钟)
    const timestamp = parseInt(tokenParts[1]);
    const now = Date.now();
    if (now - timestamp > 30 * 60 * 1000) {
      return new NextResponse('Token Expired', { status: 403 });
    }
    
    // 获取游戏
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });
    
    if (!game) {
      return new NextResponse('Game Not Found', { status: 404 });
    }
    
    // 记录游戏访问
    const session = await getServerSession(authOptions);
    await prisma.gameplay.create({
      data: {
        gameId: game.id,
        userId: session?.user?.id,
        id: uuidv4(),
        sessionId: crypto.randomUUID(),
        ipAddress: request.ip || headers().get('x-forwarded-for') || '127.0.0.1',
        deviceType: headers().get('user-agent') || '',
      }
    }).catch(err => console.error('Failed to record game play:', err));
    
    // 重定向到实际游戏URL
    return NextResponse.redirect(game.gameUrl);
    
    // 如果你想隐藏重定向，可以使用代理
    // const gameResponse = await fetch(game.gameUrl);
    // const gameContent = await gameResponse.text();
    // return new Response(gameContent, {
    //   headers: {
    //     'Content-Type': gameResponse.headers.get('Content-Type') || 'text/html',
    //     'X-Frame-Options': 'SAMEORIGIN',
    //   }
    // });
  } catch (error) {
    console.error('Error accessing game:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 