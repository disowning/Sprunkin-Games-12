import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Heart, Eye } from 'lucide-react';

export const metadata = {
  title: 'Popular Games - Sprunkin',
  description: 'Explore the most loved games by users, experience the best online gaming fun'
}

export default async function PopularGamesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // 获取查询参数
  const page = typeof searchParams.page === 'string' 
    ? parseInt(searchParams.page) 
    : 1;
  
  const pageSize = 20; // 每页显示的游戏数量
  
  // 获取游戏总数
  const totalGames = await prisma.game.count();
  
  // 计算总页数
  const totalPages = Math.ceil(totalGames / pageSize);
  
  // 获取热门游戏列表（按照收藏数量排序）
  const popularGames = await prisma.game.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [
      {
        favoritedBy: {
          _count: 'desc'
        }
      },
      {
        createdAt: 'desc'
      }
    ],
    include: {
      tags: true,
      _count: {
        select: {
          favoritedBy: true,
          reviews: true,
        },
      },
    },
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Popular Games</h1>
      <p className="text-gray-600 mb-8">
        Discover the most loved games by players and explore trending games on Sprunkin
      </p>
      
      {/* 热门游戏列表 */}
      {popularGames.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularGames.map((game, index) => (
              <Link
                key={game.id}
                href={`/game/${game.slug}`}
                className="flex bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="relative w-1/3 min-h-[160px]">
                  <Image
                    src={game.thumbnailUrl}
                    alt={game.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    #{index + 1 + (page - 1) * pageSize}
                  </div>
                </div>
                
                <div className="w-2/3 p-4">
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                    {game.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {game.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {game.description || 'Experience this exciting game, no download required, start your adventure now!'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-red-500">
                        <Heart size={16} className="mr-1" />
                        <span className="text-sm">{game._count.favoritedBy} favorites</span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star size={16} className="mr-1" />
                        <span className="text-sm">{game._count.reviews} reviews</span>
                      </div>
                    </div>
                    
                    <span className="text-blue-600 font-medium group-hover:underline">
                      Play Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10">
              <div className="flex items-center space-x-2">
                <Link
                  href={{
                    pathname: '/popular',
                    query: {
                      page: Math.max(1, page - 1)
                    }
                  }}
                  className={`flex items-center justify-center h-10 w-10 rounded-md border ${
                    page <= 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                  aria-disabled={page <= 1}
                  tabIndex={page <= 1 ? -1 : undefined}
                >
                  <ChevronLeft size={16} />
                </Link>
                
                {/* 页码 */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <Link
                      key={i}
                      href={{
                        pathname: '/popular',
                        query: { page: pageNum }
                      }}
                      className={`flex items-center justify-center h-10 w-10 rounded-md ${
                        pageNum === page
                          ? 'bg-blue-600 text-white font-medium'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                
                <Link
                  href={{
                    pathname: '/popular',
                    query: {
                      page: Math.min(totalPages, page + 1)
                    }
                  }}
                  className={`flex items-center justify-center h-10 w-10 rounded-md border ${
                    page >= totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                  aria-disabled={page >= totalPages}
                  tabIndex={page >= totalPages ? -1 : undefined}
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Popular Games Yet</h2>
          <p className="text-gray-500 mb-6">
            We're collecting user data. Please check back later for popular games.
          </p>
          <Link
            href="/games"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse All Games
          </Link>
        </div>
      )}
    </div>
  );
} 