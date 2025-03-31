'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RiUpload2Line } from 'react-icons/ri';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  tags: Tag[];
  game?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    instructions: string;
    thumbnailUrl: string;
    gameUrl: string;
    categories: Category[];
    tags: Tag[];
  };
}

export default function GameForm({ categories, tags, game }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: game?.title || '',
    slug: game?.slug || '',
    description: game?.description || '',
    instructions: game?.instructions || '',
    thumbnailUrl: game?.thumbnailUrl || '',
    gameUrl: game?.gameUrl || '',
    categoryIds: game?.categories.map((c) => c.id) || [],
    tagIds: game?.tags.map((t) => t.id) || [],
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(game?.thumbnailUrl || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 处理缩略图URL格式
      let processedThumbnailUrl = formData.thumbnailUrl;
      if (processedThumbnailUrl) {
        // 移除开头的斜杠（如果存在）
        processedThumbnailUrl = processedThumbnailUrl.replace(/^\/+/, '');
        // 如果不是完整的URL，则添加 /uploads/ 前缀
        if (!processedThumbnailUrl.startsWith('http')) {
          // 移除 uploads/ 前缀（如果存在）
          processedThumbnailUrl = processedThumbnailUrl.replace(/^uploads\//, '');
          // 添加 /uploads/ 前缀
          processedThumbnailUrl = `/uploads/${processedThumbnailUrl}`;
        }
      }

      // 如果有文件上传，使用FormData
      if (thumbnailFile) {
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('slug', formData.slug);
        formDataObj.append('description', formData.description);
        formDataObj.append('instructions', formData.instructions);
        formDataObj.append('thumbnail', thumbnailFile);
        formDataObj.append('gameUrl', formData.gameUrl);
        
        formData.categoryIds.forEach(id => formDataObj.append('categoryIds[]', id));
        formData.tagIds.forEach(id => formDataObj.append('tagIds[]', id));

        const response = await fetch(
          game ? `/api/admin/games/${game.id}` : '/api/admin/games',
          {
            method: game ? 'PUT' : 'POST',
            body: formDataObj,
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '保存失败');
        }
      } else {
        // 使用处理后的URL
        const response = await fetch(
          game ? `/api/admin/games/${game.id}` : '/api/admin/games',
          {
            method: game ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              thumbnailUrl: processedThumbnailUrl,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || '保存失败');
        }
      }

      router.push('/admin/games');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('保存失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const values = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        setError('请上传有效的图片文件');
        e.target.value = '';
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setError('图片大小不能超过2MB');
        e.target.value = '';
        return;
      }

      setThumbnailFile(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // 清除URL，因为我们现在使用文件
      setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            游戏标题
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            URL 标识
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            只能包含小写字母、数字和连字符
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            游戏描述
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            游戏说明
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            缩略图标题
          </label>
          
          <div className="mt-2 flex flex-col space-y-4">
            {/* 文件上传选项 */}
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="thumbnailFile"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900/20 dark:file:text-blue-300
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              />
            </div>
            
            {/* 或者使用URL */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">或者</span>
              <input
                type="text"
                id="thumbnailUrl"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="输入图片文件名，如：example.png"
                className="flex-1 px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                disabled={!!thumbnailFile}
              />
            </div>
            
            <p className="text-sm text-gray-500">
              支持本地图库路径 (/uploads/...) 或完整的URL地址
            </p>
            
            {/* 预览图 */}
            {thumbnailPreview && (
              <div className="relative h-48 w-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  src={thumbnailPreview}
                  alt="缩略图预览"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="gameUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            游戏 URL
          </label>
          <input
            type="url"
            id="gameUrl"
            name="gameUrl"
            value={formData.gameUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/game.html"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            直接输入游戏页面URL或iframe嵌入链接，支持HTML5游戏
          </p>
        </div>

        <div>
          <label
            htmlFor="categoryIds"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            游戏分类
          </label>
          <select
            id="categoryIds"
            name="categoryIds"
            multiple
            value={formData.categoryIds}
            onChange={handleMultiSelect}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            size={4}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">按住Ctrl键可多选</p>
        </div>

        <div>
          <label
            htmlFor="tagIds"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            游戏标签
          </label>
          <select
            id="tagIds"
            name="tagIds"
            multiple
            value={formData.tagIds}
            onChange={handleMultiSelect}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
            size={4}
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">按住Ctrl键可多选</p>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-400 disabled:opacity-50"
          >
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </form>
  );
}