import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import GameDisplay from '@/components/GameDisplay'
import Advertisement from '@/components/Advertisement'
import prisma from '@/lib/prisma'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)
  
  // 获取查询参数
  const page = typeof searchParams.page === 'string' 
    ? parseInt(searchParams.page) 
    : 1;
  
  const pageSize = 15; // 每页显示的数量
  
  // 获取置顶游戏列表（有效期内的）
  const stickyGames = await prisma.game.findMany({
    where: {
      isSticky: true,
      OR: [
        { stickyUntil: null },
        { stickyUntil: { gt: new Date() } }
      ]
    },
    orderBy: {
      stickyOrder: 'asc'
    },
    include: {
      _count: {
        select: {
          user: true,
          gamereview: true
        }
      }
    }
  })
  
  // 获取热门游戏列表（不包括已置顶的）
  const popularGames = await prisma.game.findMany({
    where: {
      isSticky: false
    },
    take: 10,
    orderBy: [{
      user: {
        _count: 'desc'
      }
    }],
    include: {
      _count: {
        select: {
          user: true,
          gamereview: true
        }
      }
    }
  })

  // 获取最新游戏总数
  const totalLatestGames = await prisma.game.count();
  
  // 获取最新游戏列表（分页）
  const latestGames = await prisma.game.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: {
          user: true,
          gamereview: true
        }
      }
    }
  })

  // 合并置顶游戏和热门游戏列表
  const combinedPopularGames = [...stickyGames, ...popularGames].slice(0, 10);

  // 默认显示第一个游戏（优先显示置顶游戏）
  const featuredGame = stickyGames.length > 0 ? stickyGames[0] : (popularGames.length > 0 ? popularGames[0] : null);
  
  if (!featuredGame) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        {/* 首页顶部广告 */}
        <div className="mb-6">
          <Advertisement location="home_top" className="w-full max-w-[960px] mx-auto" />
        </div>
        
        <GameDisplay
          popularGames={combinedPopularGames}
          latestGames={latestGames}
          initialGame={featuredGame}
          totalLatestGames={totalLatestGames}
          currentPage={page}
        />
        
        {/* 首页底部广告 */}
        <div className="mt-10">
          <Advertisement location="home_bottom" className="w-full max-w-[960px] mx-auto" />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Sprunkin - Free Online Games',
  description: 'Discover and play the best free online games',
}; 