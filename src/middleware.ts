import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 管理员路径检查
  if (path.startsWith('/admin')) {
    const session = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // 没有会话或非管理员角色，重定向到登录页面
    if (!session || session.role !== 'ADMIN') {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  // 保护游戏包装页
  if (path.startsWith('/play/')) {
    const referer = request.headers.get('referer');
    const validReferer = referer && (
      referer.includes('/game/') || 
      referer.includes('/admin/') ||
      new URL(referer).hostname === new URL(request.url).hostname
    );
    
    if (!validReferer) {
      // 获取slug
      const slug = path.split('/')[2];
      return NextResponse.redirect(new URL(`/game/${slug}`, request.url));
    }
  }
  
  return NextResponse.next();
}

// 配置中间件适用的路径
export const configPlay = {
  matcher: '/play/:path*',
};