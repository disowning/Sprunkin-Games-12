import Link from 'next/link';
import { PanelLeft, Gamepad, TagIcon, Settings } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">游戏管理后台</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/admin/dashboard" className="flex items-center p-2 rounded hover:bg-gray-700">
              <PanelLeft className="mr-2" size={20} />
              仪表盘
            </Link>
          </li>
          <li>
            <Link href="/admin/games" className="flex items-center p-2 rounded hover:bg-gray-700">
              <Gamepad className="mr-2" size={20} />
              游戏管理
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="flex items-center p-2 rounded hover:bg-gray-700">
              <TagIcon className="mr-2" size={20} />
              分类管理
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="flex items-center p-2 rounded hover:bg-gray-700">
              <Settings className="mr-2" size={20} />
              网站设置
            </Link>
          </li>
        </ul>
      </nav>
      
    </div>
  );
} 