'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SeoSettingsFormProps {
  initialValues: {
    homeSeoTitle: string;
    homeSeoDescription: string;
    gameSeoTitle: string;
  };
}

export default function SeoSettingsForm({ initialValues }: SeoSettingsFormProps) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          home_seo_title: values.homeSeoTitle,
          home_seo_description: values.homeSeoDescription,
          game_seo_title: values.gameSeoTitle,
        }),
      });
      
      if (response.ok) {
        setMessage('设置已保存');
        router.refresh();
      } else {
        const data = await response.json();
        setMessage(`保存失败: ${data.error}`);
      }
    } catch (error) {
      setMessage('保存失败，请稍后重试');
      console.error('提交SEO设置出错:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            首页SEO标题
          </label>
          <input
            type="text"
            value={values.homeSeoTitle}
            onChange={(e) => setValues({...values, homeSeoTitle: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">在首页展示的标题</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            首页SEO描述
          </label>
          <textarea
            value={values.homeSeoDescription}
            onChange={(e) => setValues({...values, homeSeoDescription: e.target.value})}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">首页的简短描述</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            游戏页SEO标题模板
          </label>
          <input
            type="text"
            value={values.gameSeoTitle}
            onChange={(e) => setValues({...values, gameSeoTitle: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            使用 {"{game_title}"} 作为游戏标题的占位符。例如: "立即玩 {"{game_title}"} - 免费在线游戏"
          </p>
        </div>
        
        {message && (
          <div className={`p-3 rounded ${message.includes('失败') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </form>
  );
} 