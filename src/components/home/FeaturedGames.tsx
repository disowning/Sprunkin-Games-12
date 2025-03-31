 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// 模拟数据
const featuredGames = [
  {
    id: '1',
    title: '宝石大师',
    slug: 'gem-master',
    description: '将相同颜色的宝石配对，解锁特殊能力，挑战你的益智技能。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?q=80&w=2070&auto=format&fit=crop',
    category: '益智',
  },
  {
    id: '2',
    title: '星际战舰',
    slug: 'space-battleship',
    description: '指挥你的太空舰队，在星际战场上与敌人进行策略对战。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1974&auto=format&fit=crop',
    category: '策略',
  },
  {
    id: '3',
    title: '丛林冒险',
    slug: 'jungle-adventure',
    description: '在危险的丛林中探险，收集宝藏，躲避陷阱，体验刺激的冒险。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1615639164213-aab04da93c7c?q=80&w=2074&auto=format&fit=crop',
    category: '冒险',
  },
  {
    id: '4',
    title: '赛车英雄',
    slug: 'racing-hero',
    description: '在世界各地的赛道上驾驶超级跑车，体验速度与激情。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511286148006-ec48824e3282?q=80&w=2070&auto=format&fit=crop',
    category: '赛车',
  },
];

export default function FeaturedGames() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredGames.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredGames.length - 1 : prevIndex - 1
    );
  };

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 轮播控制按钮 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
        aria-label="上一个游戏"
      >
        <FiChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
        aria-label="下一个游戏"
      >
        <FiChevronRight className="h-6 w-6" />
      </button>
      
      {/* 轮播内容 */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {featuredGames.map((game) => (
          <div key={game.id} className="w-full flex-shrink-0">
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Image
                src={game.thumbnailUrl}
                alt={game.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
                <span className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full mb-3">
                  {game.category}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{game.title}</h3>
                <p className="text-white/80 mb-4 max-w-xl">{game.description}</p>
                <Link 
                  href={`/games/${game.slug}`} 
                  className="btn-primary inline-block"
                >
                  开始游戏
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {featuredGames.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`切换到游戏 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}