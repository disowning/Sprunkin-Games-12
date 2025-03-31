import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import GameFilters from '@/components/GameFilters';

export const metadata = {
  title: 'All Games - Sprunkin',
  description: 'Explore our diverse game library and find your favorite free online games'
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // 获取查询参数
  const page = typeof searchParams.page === 'string' 
    ? parseInt(searchParams.page) 
    : 1;
  const search = typeof searchParams.search === 'string'
    ? searchParams.search
    : '';
  const category = typeof searchParams.category === 'string'
    ? searchParams.category
    : '';
  
  const pageSize = 20; // 每页显示的游戏数量
  
  // 构建查询条件
  const where: any = {};
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (category) {
    where.category = category;
  }
  
  // 获取游戏总数
  const totalGames = await prisma.game.count({ where });
  
  // 计算总页数
  const totalPages = Math.ceil(totalGames / pageSize);
  
  // 获取游戏列表
  const games = await prisma.game.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      title: 'asc'
    },
    include: {
      tag: true,
      user: true
    },
  });
  
  // 获取所有分类，用于筛选
  const categories = ['Uncategorized', 'Action', 'Adventure', 'Shooting', 'Strategy', 'Puzzle', 'Sports', 'Racing', 'Music', 'Others'];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Games</h1>
      
      {/* 使用新的GameFilters组件 */}
      <GameFilters />
      
      {/* 游戏列表 */}
      {games.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {games.map((game) => (
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
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                  {game.title}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>{game.user?.length || 0} favorites</span>
                  <span className="mx-1">•</span>
                  <span>{game.category}</span>
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
                    pathname: '/games',
                    query: {
                      ...(search ? { search } : {}),
                      ...(category ? { category } : {}),
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
                        pathname: '/games',
                        query: {
                          ...(search ? { search } : {}),
                          ...(category ? { category } : {}),
                          page: pageNum
                        }
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
                    pathname: '/games',
                    query: {
                      ...(search ? { search } : {}),
                      ...(category ? { category } : {}),
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Games Found</h2>
          <p className="text-gray-500 mb-6">
            Try different search criteria or browse our other games
          </p>
          <Link
            href="/games"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Games
          </Link>
        </div>
      )}
    </div>
  );
} 