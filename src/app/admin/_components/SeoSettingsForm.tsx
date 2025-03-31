'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SeoConfig {
  id: string;
  homeTitle: string;
  homeDescription: string;
  gamePlayingTitleTemplate: string;
}

export default function SeoSettingsForm({ initialData }: { initialData: SeoConfig }) {
  const [formData, setFormData] = useState<Omit<SeoConfig, 'id'>>({
    homeTitle: initialData.homeTitle,
    homeDescription: initialData.homeDescription,
    gamePlayingTitleTemplate: initialData.gamePlayingTitleTemplate,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/seo-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '保存SEO设置失败');
      }
      
      setSuccess('SEO设置已成功保存！');
      router.refresh(); // 刷新页面数据
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          首页标题
        </label>
        <input
          type="text"
          name="homeTitle"
          value={formData.homeTitle}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-gray-600 text-sm mt-1">
          用于SEO的主页标题，应包含网站名称和关键词
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          首页描述
        </label>
        <textarea
          name="homeDescription"
          value={formData.homeDescription}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
        <p className="text-gray-600 text-sm mt-1">
          简短描述网站内容，显示在标题下方
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          游戏播放页标题模板
        </label>
        <input
          type="text"
          name="gamePlayingTitleTemplate"
          value={formData.gamePlayingTitleTemplate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-gray-600 text-sm mt-1">
          使用 {'{gameName}'} 作为游戏名称的占位符
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存设置'}
        </button>
      </div>
    </form>
  );
} 