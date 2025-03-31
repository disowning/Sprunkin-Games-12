 'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiStar } from 'react-icons/fi';

// 模拟数据
const popularGames = [
  {
    id: '1',
    title: '宇宙探险家',
    slug: 'space-explorer',
    description: '探索浩瀚宇宙，收集资源，建造基地，与外星文明互动。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?q=80&w=2070&auto=format&fit=crop',
    category: '冒险',
    rating: 4.8,
    views: 125340,
  },
  {
    id: '2',
    title: '城市建设者',
    slug: 'city-builder',
    description: '建设和管理你自己的城市，平衡资源，解决市民问题，创造繁荣的都市。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    category: '策略',
    rating: 4.6,
    views: 98750,
  },
  {
    id: '3',
    title: '方块消除',
    slug: 'block-breaker',
    description: '将相同颜色的方块放在一起消除，获得高分，挑战你的益智能力。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop',
    category: '益智',
    rating: 4.5,
    views: 87620,
  },
  {
    id: '4',
    title: '忍者跳跃',
    slug: 'ninja-jump',
    description: '控制你的忍者角色，跳跃闪避障碍物，收集金币，挑战各种关卡。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
    category: '动作',
    rating: 4.7,
    views: 106480,
  },
  {
    id: '5',
    title: '海底世界',
    slug: 'underwater-world',
    description: '探索神秘的海底世界，发现奇妙的海洋生物，解开深海的秘密。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?q=80&w=2070&auto=format&fit=crop',
    category: '冒险',
    rating: 4.4,
    views: 76920,
  },
  {
    id: '6',
    title: '赛车挑战',
    slug: 'racing-challenge',
    description: '参加刺激的赛车比赛，展示你的驾驶技巧，成为赛道冠军。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?q=80&w=2070&auto=format&fit=crop',
    category: '赛车',
    rating: 4.9,
    views: 134560,
  },
];

export default function PopularGames() {
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {popularGames.map((game) => (
        <div key={game.id} className="card overflow-hidden group">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={game.thumbnailUrl}
              alt={game.title}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-4 left-4">
              <span className="inline-block px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
                {game.category}
              </span>
            </div>
            <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/40 text-white rounded-full px-2 py-1 text-xs">
              <FiStar className="h-3 w-3 text-yellow-400" />
              <span>{game.rating}</span>
            </div>
            <Link
              href={`/games/${game.slug}`}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-all transform scale-90 group-hover:scale-100">
                <FiPlay className="h-6 w-6" />
              </span>
            </Link>
          </div>
          <div className="p-4">
            <Link href={`/games/${game.slug}`} className="inline-block">
              <h3 className="text-lg font-semibold hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                {game.title}
              </h3>
            </Link>
            <p className="mt-2 text-sm text-text-light/70 dark:text-text-dark/70 line-clamp-2">
              {game.description}
            </p>
            <div className="mt-3 flex items-center text-sm text-text-light/60 dark:text-text-dark/60">
              <span>{formatViews(game.views)} 次游玩</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}