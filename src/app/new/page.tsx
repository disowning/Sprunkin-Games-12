import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const metadata = {
  title: 'New Games - Sprunkin',
  description: 'Explore the latest games added to Sprunkin, try fresh gaming experiences'
}

export default async function NewGamesPage({
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
  
  // 获取最新游戏列表
  const newGames = await prisma.game.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      createdAt: true,
      category: true,
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });

  // 格式化日期函数
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">New Games</h1>
      <p className="text-gray-600 mb-8">
        Explore our latest additions and experience fresh gaming content
      </p>
      
      {/* 最新游戏列表 */}
      {newGames.length > 0 ? (
        <>
          <div className="space-y-6">
            {/* 最近上线的特色游戏 */}
            {page === 1 && newGames.length > 0 && (
              <div className="relative rounded-xl overflow-hidden shadow-lg mb-10">
                <div className="relative aspect-[21/9]">
                  <Image
                    src={newGames[0].thumbnailUrl}
                    alt={newGames[0].title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center mb-2">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">
                      {formatDate(newGames[0].createdAt)}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{newGames[0].title}</h2>
                  <p className="text-white/90 mb-4 max-w-3xl">
                    {newGames[0].description?.slice(0, 150)}
                    {newGames[0].description && newGames[0].description.length > 150 ? '...' : ''}
                  </p>
                  <Link
                    href={`/game/${newGames[0].slug}`}
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                  >
                    Play Now
                  </Link>
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  New
                </div>
              </div>
            )}
            
            {/* 游戏列表网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {newGames.slice(page === 1 ? 1 : 0).map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[3/2] rounded-lg overflow-hidden mb-2">
                    <Image
                      src={game.thumbnailUrl}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="flex items-center text-white text-xs">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(game.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {game.title}
                  </h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>{game._count.favoritedBy} Favorites</span>
                    <span className="mx-1">•</span>
                    <span>{game.category || 'Uncategorized'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10">
              <div className="flex items-center space-x-2">
                <Link
                  href={{
                    pathname: '/new',
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
                        pathname: '/new',
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
                    pathname: '/new',
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No New Games Yet</h2>
          <p className="text-gray-500 mb-6">
            We're working hard to add new games. Please check back later.
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