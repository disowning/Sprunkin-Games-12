'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon, TrashIcon, PlusIcon, XCircleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载所有标签
  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/tags');
      
      if (!response.ok) {
        throw new Error('获取标签列表失败');
      }
      
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('加载标签失败:', error);
      toast.error('加载标签失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // 添加新标签
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast.error('标签名称不能为空');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTagName }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '创建标签失败');
      }
      
      const newTag = await response.json();
      setTags(prev => [...prev, newTag]);
      setNewTagName('');
      setIsCreating(false);
      toast.success('标签创建成功');
      router.refresh();
    } catch (error) {
      console.error('创建标签失败:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        toast.error('标签名称已存在');
      } else {
        toast.error('创建标签失败');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 修改标签
  const handleUpdateTag = async (id: string) => {
    if (!editingName.trim()) {
      toast.error('标签名称不能为空');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingName }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '更新标签失败');
      }
      
      const updatedTag = await response.json();
      setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
      setEditingId(null);
      toast.success('标签更新成功');
      router.refresh();
    } catch (error) {
      console.error('更新标签失败:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        toast.error('标签名称已存在');
      } else {
        toast.error('更新标签失败');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除标签
  const handleDeleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？这将会从所有关联的游戏中移除此标签。')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '删除标签失败');
      }
      
      setTags(prev => prev.filter(tag => tag.id !== id));
      toast.success('标签删除成功');
      router.refresh();
    } catch (error) {
      console.error('删除标签失败:', error);
      toast.error('删除标签失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setNewTagName('');
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
      <h1 className="text-2xl font-bold mb-8">标签管理</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        {!isCreating ? (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              <PlusIcon className="h-4 w-4" />
              <span>添加标签</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateTag} className="mb-6">
            <div>
              <label htmlFor="newTagName" className="block text-sm font-medium text-gray-700 mb-2">
                标签名称
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newTagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入标签名称，如：热门、休闲"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  disabled={isSubmitting}
                >
                  <CheckIcon className="h-4 w-4" />
                  确认
                </button>
                <button
                  type="button"
                  onClick={cancelCreating}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  disabled={isSubmitting}
                >
                  <XCircleIcon className="h-4 w-4" />
                  取消
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标签名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL 标识
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无标签数据，请添加新标签
                  </td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      ) : (
                        tag.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tag.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tag.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === tag.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateTag(tag.id)}
                            className="text-green-600 hover:text-green-900"
                            disabled={isSubmitting}
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-900"
                            disabled={isSubmitting}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => startEditing(tag)}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={isSubmitting || editingId !== null}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isSubmitting || editingId !== null}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 