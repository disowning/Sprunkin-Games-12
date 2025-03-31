 'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';

// 模拟数据
const categories = [
  {
    id: '1',
    name: '动作游戏',
    slug: 'action',
    description: '快节奏的游戏，需要良好的反应能力和手眼协调。',
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1974&auto=format&fit=crop',
    count: 45,
  },
  {
    id: '2',
    name: '益智游戏',
    slug: 'puzzle',
    description: '测试你的解题能力，包括逻辑、模式识别和序列解决。',
    imageUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=2070&auto=format&fit=crop',
    count: 68,
  },
  {
    id: '3',
    name: '策略游戏',
    slug: 'strategy',
    description: '需要仔细规划和资源管理的游戏，考验你的战略思维。',
    imageUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=2070&auto=format&fit=crop',
    count: 37,
  },
  {
    id: '4',
    name: '冒险游戏',
    slug: 'adventure',
    description: '探索、收集和解谜为主的游戏，通常有引人入胜的故事。',
    imageUrl: 'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?q=80&w=2070&auto=format&fit=crop',
    count: 53,
  },
  {
    id: '5',
    name: '射击游戏',
    slug: 'shooter',
    description: '以射击敌人为主要玩法的游戏，考验你的瞄准和反应能力。',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1947&auto=format&fit=crop',
    count: 29,
  },
  {
    id: '6',
    name: '角色扮演',
    slug: 'rpg',
    description: '扮演角色，提升能力，体验丰富故事情节的游戏。',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    count: 42,
  },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link 
          key={category.id} 
          href={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-xl card hover:shadow-lg transition-all"
        >
          <div className="relative h-40 overflow-hidden">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{category.name}</h3>
                <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">{category.count}</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-text-light/70 dark:text-text-dark/70 mb-3 line-clamp-2">
              {category.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors flex items-center">
                浏览游戏
                <FiArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}