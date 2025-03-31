'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { PinIcon, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Game {
  id: string;
  title: string;
  thumbnailUrl: string;
  gameUrl: string;
  isSticky?: boolean;
  category: string;
  _count?: {
    user: number;
    gamereview: number;
  };
}

interface GameDisplayProps {
  popularGames: Game[];
  latestGames: Game[];
  initialGame: Game;
  totalLatestGames: number;
  currentPage: number;
}

export default function GameDisplay({ 
  popularGames, 
  latestGames, 
  initialGame,
  totalLatestGames,
  currentPage = 1
}: GameDisplayProps) {
  const [currentGame, setCurrentGame] = useState<Game>(initialGame);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const gameDisplayRef = useRef<HTMLDivElement>(null);
  
  // 添加SEO配置状态
  const [seoConfig, setSeoConfig] = useState({
    homeTitle: 'Featured Game Recommendations - Latest & Most Popular Free Online Games | Sprunkin',
    homeDescription: 'Explore our carefully selected popular games and experience unlimited fun, completely free!',
    gameTitle: 'Play {game_title} - Free Online Games'
  });

  const pageSize = 15; // 每页显示的游戏数量
  const totalPages = Math.ceil(totalLatestGames / pageSize);
  
  // 获取SEO配置
  useEffect(() => {
    const fetchSeoConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        
        if (data.configs) {
          setSeoConfig({
            homeTitle: data.configs.home_seo_title || seoConfig.homeTitle,
            homeDescription: data.configs.home_seo_description || seoConfig.homeDescription,
            gameTitle: data.configs.game_seo_title || seoConfig.gameTitle
          });
        }
      } catch (error) {
        console.error('获取SEO配置失败:', error);
      }
    };
    
    fetchSeoConfig();
  }, []);
  
  const switchGame = (game: Game) => {
    setCurrentGame(game);
    setIsPlaying(false);
    
    // 滚动到游戏展示区
    if (gameDisplayRef.current) {
      gameDisplayRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/?page=${newPage}`);
      // 滚动到游戏列表顶部
      const latestGamesHeader = document.getElementById('latest-games-header');
      if (latestGamesHeader) {
        latestGamesHeader.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 生成SEO友好的标题
  const generateSeoTitle = () => {
    if (isPlaying) {
      return seoConfig.gameTitle.replace('{game_title}', currentGame.title);
    }
    return seoConfig.homeTitle;
  };

  return (
    <div className="relative w-full">
      {/* SEO 标题 */}
      <div className="max-w-[960px] mx-auto mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {generateSeoTitle()}
        </h1>
        <p className="text-gray-600 mt-2">
          {seoConfig.homeDescription}
        </p>
      </div>

      {/* 主游戏区域 - 添加ref */}
      <div ref={gameDisplayRef} className="relative w-full mb-8">
        <div className="max-w-[960px] mx-auto rounded-2xl overflow-hidden shadow-md relative">
          {isPlaying ? (
            // 游戏播放模式
            <div className="relative w-full aspect-[16/9] bg-black">
              <iframe
                src={currentGame.gameUrl}
                className="w-full h-full"
                allow="fullscreen; autoplay; encrypted-media"
                style={{ border: 'none' }}
              />
              <button
                onClick={() => {
                  const iframe = document.querySelector('iframe');
                  if (iframe && iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                  }
                }}
                className="absolute bottom-6 right-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl z-10"
              >
                Fullscreen
              </button>
            </div>
          ) : (
            // 游戏预览模式
            <div className="relative w-full aspect-[16/9]">
              {/* 背景图片层 */}
              <div className="absolute inset-0">
                <Image
                  src={currentGame.thumbnailUrl}
                  alt="Background"
                  fill
                  className="object-cover blur-sm scale-110"
                  priority
                />
              </div>

              {/* 蓝色渐变遮罩层 */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/90 to-blue-700/90"></div>
              
              {/* 内容容器 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center py-10 px-6 text-center">
                {/* 游戏缩略图 */}
                <div className="relative w-[400px] h-[225px] mb-6 rounded-xl overflow-hidden border-4 border-white/30 shadow-xl">
                  <Image
                    src={currentGame.thumbnailUrl}
                    alt={currentGame.title}
                    fill
                    className="object-cover"
                  />
                  {currentGame.isSticky && (
                    <div className="absolute top-2 right-2 bg-yellow-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center">
                      <PinIcon size={10} className="mr-1" />
                      Featured
                    </div>
                  )}
                </div>
                
                {/* 游戏标题 */}
                <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-md">
                  {currentGame.title}
                </h2>
                
                {/* 分类标签 */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    {currentGame.category}
                  </span>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                    {currentGame._count?.user || 0} Likes
                  </span>
                </div>
                
                {/* 播放按钮 */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
                >
                  <Play size={22} />
                  Play Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 游戏列表区域 */}
      <div className="relative bg-gray-50">
        <div className="grid grid-cols-5 gap-6 max-w-[1280px] mx-auto w-full">
          <div className="col-span-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Games</h2>
          </div>
          {popularGames.slice(0, 5).map((game) => (
            <button
              key={game.id}
              onClick={() => switchGame(game)}
              className="block w-full text-left group"
            >
              <div className="relative h-40 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                <Image
                  src={game.thumbnailUrl}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {game.isSticky && (
                  <div className="absolute top-2 right-2 bg-yellow-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center">
                    <PinIcon size={10} className="mr-1" />
                    Featured
                  </div>
                )}
              </div>
              <h3 className="font-medium text-gray-800 mt-2 truncate group-hover:text-blue-600 transition-colors">
                {game.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{game.category}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{game._count?.user || 0} Likes</span>
              </div>
            </button>
          ))}

          <div id="latest-games-header" className="col-span-5 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Games</h2>
          </div>
          {latestGames.map((game) => (
            <button
              key={game.id}
              onClick={() => switchGame(game)}
              className="block w-full text-left group"
            >
              <div className="relative h-40 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                <Image
                  src={game.thumbnailUrl}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {game.isSticky && (
                  <div className="absolute top-2 right-2 bg-yellow-500/80 text-white text-xs font-medium py-1 px-2 rounded-full flex items-center">
                    <PinIcon size={10} className="mr-1" />
                    Featured
                  </div>
                )}
              </div>
              <h3 className="font-medium text-gray-800 mt-2 truncate group-hover:text-blue-600 transition-colors">
                {game.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{game.category}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{game._count?.user || 0} Likes</span>
              </div>
            </button>
          ))}
        </div>

        {/* 分页控制 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 