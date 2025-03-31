 'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiClock } from 'react-icons/fi';

// 模拟数据
const newGames = [
  {
    id: '1',
    title: '模拟农场',
    slug: 'farm-simulator',
    description: '经营你自己的农场，种植农作物，饲养动物，扩大你的农业帝国。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=2071&auto=format&fit=crop',
    category: '模拟',
    addedDays: 2,
  },
  {
    id: '2',
    title: '幽灵猎人',
    slug: 'ghost-hunter',
    description: '探索废弃的建筑物，寻找超自然现象，捕捉幽灵，解开神秘事件。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=2070&auto=format&fit=crop',
    category: '冒险',
    addedDays: 3,
  },
  {
    id: '3',
    title: '魔法学院',
    slug: 'magic-academy',
    description: '成为一名魔法学徒，学习各种法术，完成任务，成为强大的魔法师。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=2069&auto=format&fit=crop',
    category: '角色扮演',
    addedDays: 5,
  },
  {
    id: '4',
    title: '厨师大赛',
    slug: 'chef-competition',
    description: '展示你的烹饪技巧，准备美味菜肴，参加烹饪比赛，成为顶级厨师。',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576515652388-64356e938129?q=80&w=2070&auto=format&fit=crop',
    category: '模拟',
    addedDays: 7,
  },
];

export default function NewGames() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {newGames.map((game) => (
        <div key={game.id} className="card overflow-hidden group">
          <div className="relative h-40 overflow-hidden">
            <Image
              src={game.thumbnailUrl}
              alt={game.title}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-3 left-3">
              <span className="inline-block px-2 py-1 bg-secondary-500 text-white text-xs font-semibold rounded-full">
                新游戏
              </span>
            </div>
            <Link
              href={`/games/${game.slug}`}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full transition-all transform scale-90 group-hover:scale-100">
                <FiPlay className="h-5 w-5" />
              </span>
            </Link>
          </div>
          <div className="p-3">
            <Link href={`/games/${game.slug}`} className="inline-block">
              <h3 className="text-base font-semibold hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-1">
                {game.title}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-text-light/70 dark:text-text-dark/70 line-clamp-2">
              {game.description}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs px-2 py-1 bg-background-dark/5 dark:bg-background-light/5 rounded-full">
                {game.category}
              </span>
              <div className="flex items-center text-xs text-text-light/60 dark:text-text-dark/60">
                <FiClock className="h-3 w-3 mr-1" />
                <span>{game.addedDays} 天前</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}