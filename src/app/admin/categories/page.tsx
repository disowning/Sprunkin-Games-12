'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  _count: {
    games: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '获取分类列表失败');
      }
      const data = await response.json();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取分类列表失败');
      console.error('获取分类列表错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = errorData?.message || await response.text();
        throw new Error(errorText || '添加分类失败');
      }

      toast.success('分类添加成功');
      setNewCategory('');
      await fetchCategories(); // 重新获取分类列表
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加分类失败';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('添加分类错误:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？此操作不可恢复。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorText = errorData?.message || await response.text();
        throw new Error(errorText || '删除分类失败');
      }

      toast.success('分类删除成功');
      await fetchCategories(); // 重新获取分类列表
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除分类失败';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('删除分类错误:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">分类管理</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <form onSubmit={handleSubmit} className="mb-6">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
              分类名称
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="categoryName"
                id="categoryName"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入分类名称，如：益智游戏、动作游戏"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !newCategory.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '添加中...' : '添加分类'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  游戏数量
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category._count.games} 个游戏
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={category._count.games > 0}
                      title={category._count.games > 0 ? '该分类下有游戏，无法删除' : '删除分类'}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无分类数据，请添加新分类
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 