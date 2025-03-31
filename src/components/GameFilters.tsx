'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function GameFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  
  // 处理表单提交
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const category = formData.get('category') as string;
    
    // 构建查询参数
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    
    // 跳转到新的URL
    router.push(`/games${params.toString() ? `?${params.toString()}` : ''}`);
  }, [router]);
  
  // 所有游戏分类
  const categories = ['Uncategorized', 'Action', 'Adventure', 'Shooting', 'Strategy', 'Puzzle', 'Sports', 'Racing', 'Music', 'Others'];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search games..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        {/* 分类筛选 */}
        <div>
          <select
            name="category"
            defaultValue={category}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* 搜索按钮 */}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
} 