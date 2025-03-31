 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import {
  RiDashboardLine,
  RiGamepadLine,
  RiUserLine,
  RiFileListLine,
  RiPriceTag3Line,
} from 'react-icons/ri';

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: '仪表盘',
    icon: RiDashboardLine,
  },
  {
    href: '/admin/games',
    label: '游戏管理',
    icon: RiGamepadLine,
  },
  {
    href: '/admin/users',
    label: '用户管理',
    icon: RiUserLine,
  },
  {
    href: '/admin/categories',
    label: '分类管理',
    icon: RiFileListLine,
  },
  {
    href: '/admin/tags',
    label: '标签管理',
    icon: RiPriceTag3Line,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold">管理后台</h1>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}