import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Heart, Share2, Play } from 'lucide-react';

// 生成元数据
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    // include: { categories: true }
  });
  
  if (!game) {
    return {
      title: 'Game Not Found - Sprunkin',
      description: 'The requested game could not be found'
    };
  }
  
  return {
    title: `${game.title} - Sprunkin`,
    description: game.description || `Play ${game.title} for free on Sprunkin`
  };
}

export default async function GamePage({ params }: { params: { slug: string } }) {
  // 获取游戏详情
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: {
      tag: true,
      gamereview: {
        include: {
          user: true
        }
      },
      user: true
    },
  });
  
  if (!game) {
    notFound();
  }
  
  // 获取相关游戏
  const relatedGames = await prisma.game.findMany({
    where: {
      // categories: {
      //   some: {
      //     id: {
      //       in: game.categories.map(c => c.id)
      //     }
      //   }
      // },
      id: {
        not: game.id
      }
    },
    take: 5,
    // include: {
    //   categories: true,
    // },
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
      <div className="mb-6">
        <Link href="/games" className="text-blue-600 hover:underline">
          ← Back to Games
        </Link>
      </div>
      
      {/* 游戏详情 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
        {/* 游戏标题和操作 */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-800">{game.title}</h1>
            <div className="flex items-center space-x-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors">
                <Heart size={18} />
                <span>Favorite</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors">
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 游戏内容 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
          {/* 游戏缩略图 */}
          <div className="md:col-span-1">
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden mb-4">
              <Image
                src={game.thumbnailUrl}
                alt={game.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Added Date</span>
                <span className="text-gray-900">{formatDate(game.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Favorites</span>
                <span className="text-gray-900">{game.user?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reviews</span>
                <span className="text-gray-900">{game.gamereview?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories</span>
                <div className="flex flex-wrap justify-end gap-1">
                  {/* {game.categories.map((category) => (
                    <Link 
                      key={category.id} 
                      href={`/games?category=${category.slug}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {category.name}
                    </Link>
                  ))} */}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <a
                href={game.gameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-lg font-medium"
              >
                <Play size={20} />
                Play Now
              </a>
            </div>
          </div>
          
          {/* 游戏详情和内容 */}
          <div className="md:col-span-2">
            {/* 游戏描述 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Description</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {game.description || 'An exciting game you can play directly in your browser, no download required!'}
                </p>
              </div>
            </div>
            
            {/* 游戏玩法说明 */}
            {game.instructions && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">How to Play</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {game.instructions}
                  </p>
                </div>
              </div>
            )}
            
            {/* 游戏评论区（占位）*/}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Reviews</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">Login to view and post reviews</p>
                <Link 
                  href="/auth/login"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 相关游戏 */}
      {relatedGames.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {relatedGames.map((relatedGame) => (
              <Link
                key={relatedGame.id}
                href={`/game/${relatedGame.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden mb-2">
                  <Image
                    src={relatedGame.thumbnailUrl}
                    alt={relatedGame.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                  {relatedGame.title}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  {/* <span>{relatedGame.categories[0]?.name || 'Uncategorized'}</span> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}