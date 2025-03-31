import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp } from 'lucide-react';
import GamePlayer from '@/components/GamePlayer';

// 生成元数据
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
  });
  
  if (!game) {
    return {
      title: 'Game Not Found - Sprunkin',
    };
  }
  
  return {
    title: `Play ${game.title} - Sprunkin`,
    description: game.description || `Play ${game.title} for free at Sprunkin`,
  };
}

export default async function PlayGamePage({ params }: { params: { slug: string } }) {
  // 获取游戏信息
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    // include: {
    //   categories: true,
    // },
  });
  
  if (!game) {
    notFound();
  }
  
  // 更新游戏浏览次数逻辑可以在这里添加
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 p-4 text-white">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href={`/game/${game.slug}`} 
              className="flex items-center gap-1 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span>Back to game info</span>
            </Link>
            <h1 className="text-xl font-bold truncate">{game.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 按钮移到客户端组件中处理 */}
          </div>
        </div>
      </div>
      
      {/* 使用客户端组件处理游戏播放 */}
      <GamePlayer 
        gameUrl={game.gameUrl} 
        gameTitle={game.title} 
        slug={game.slug}
      />
      
      {/* 可以在这里添加相关游戏推荐 */}
      <div className="bg-gray-800 p-4 text-white">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-sm text-gray-400">
            Playing <span className="text-white">{game.title}</span>
            {/* {game.categories && game.categories.length > 0 && (
              <> - Categories: {game.categories.map(cat => cat.name).join(', ')}</>
            )} */}
          </p>
        </div>
      </div>
    </div>
  );
} 