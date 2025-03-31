 'use client';

import Link from 'next/link';
import { FiGithub, FiTwitter, FiFacebook, FiInstagram } from 'react-icons/fi';

const navigation = {
  主要: [
    { name: '首页', href: '/' },
    { name: '所有游戏', href: '/games' },
    { name: '分类', href: '/categories' },
    { name: '热门游戏', href: '/popular' },
    { name: '新游戏', href: '/new' },
  ],
  分类: [
    { name: '动作游戏', href: '/categories/action' },
    { name: '益智游戏', href: '/categories/puzzle' },
    { name: '策略游戏', href: '/categories/strategy' },
    { name: '多人游戏', href: '/categories/multiplayer' },
    { name: '冒险游戏', href: '/categories/adventure' },
  ],
  关于: [
    { name: '关于我们', href: '/about' },
    { name: '博客', href: '/blog' },
    { name: '联系我们', href: '/contact' },
    { name: '隐私政策', href: '/privacy' },
    { name: '使用条款', href: '/terms' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background-light/50 dark:bg-background-dark/50 border-t border-text-light/10 dark:border-text-dark/10">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text text-2xl font-bold">
                游戏站
              </span>
            </Link>
            <p className="text-sm text-text-light/70 dark:text-text-dark/70 mb-4 max-w-xs">
              探索数百种免费在线游戏。无需下载，无需注册，直接在浏览器中游玩。
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-text-light/60 dark:text-text-dark/60 hover:text-primary-500 dark:hover:text-primary-400"
                aria-label="Twitter"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-text-light/60 dark:text-text-dark/60 hover:text-primary-500 dark:hover:text-primary-400"
                aria-label="Facebook"
              >
                <FiFacebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-text-light/60 dark:text-text-dark/60 hover:text-primary-500 dark:hover:text-primary-400"
                aria-label="Instagram"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-text-light/60 dark:text-text-dark/60 hover:text-primary-500 dark:hover:text-primary-400"
                aria-label="GitHub"
              >
                <FiGithub className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {Object.keys(navigation).map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {navigation[category as keyof typeof navigation].map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href} 
                      className="text-sm text-text-light/70 dark:text-text-dark/70 hover:text-primary-500 dark:hover:text-primary-400"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-text-light/10 dark:border-text-dark/10 flex flex-col items-center">
          <p className="text-sm text-text-light/60 dark:text-text-dark/60">
            &copy; {currentYear} 游戏站. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
}