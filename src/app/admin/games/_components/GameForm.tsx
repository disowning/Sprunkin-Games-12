'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  downloadUrl?: string;
  categoryIds: string[];
  tagIds: string[];
  gameUrl?: string;
}

interface GameFormProps {
  game?: Game;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

export default function GameForm({ game, onSubmit, isLoading }: GameFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(game?.thumbnailUrl || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    // 获取分类和标签数据
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/tags'),
        ]);

        if (!categoriesRes.ok || !tagsRes.ok) {
          throw new Error('加载分类或标签数据失败');
        }

        const [categoriesData, tagsData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json(),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
        setFetchError('');
      } catch (err) {
        setFetchError('加载分类和标签数据失败，请刷新页面重试');
        console.error('Failed to fetch data:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};
    
    // 验证标题
    const title = formData.get('title') as string;
    if (!title?.trim()) {
      errors.title = '请输入游戏标题';
    }

    // 验证描述
    const description = formData.get('description') as string;
    if (!description?.trim()) {
      errors.description = '请输入游戏描述';
    }

    // 修改缩略图验证逻辑
    const thumbnail = formData.get('thumbnail') as File;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    
    // 判断是否有缩略图（通过文件或URL）
    const hasThumbnailFile = thumbnail && thumbnail.size > 0;
    const hasThumbnailUrl = thumbnailUrl && thumbnailUrl.trim().length > 0;
    
    if (!hasThumbnailFile && !hasThumbnailUrl && !game?.thumbnailUrl) {
      errors.thumbnail = '请上传游戏缩略图或提供图片文件名';
    } else if (hasThumbnailUrl) {
      // 验证文件名格式
      const isValidFileName = /^[a-zA-Z0-9-]+\.(png|jpg|jpeg|gif)$/.test(thumbnailUrl.trim());
      if (!isValidFileName) {
        errors.thumbnailUrl = '请输入正确的图片文件名，例如：example.png';
      }
    }

    // 验证下载链接
    const downloadUrl = formData.get('downloadUrl') as string;
    if (!downloadUrl?.trim()) {
      errors.downloadUrl = '请输入下载链接';
    } else {
      try {
        new URL(downloadUrl);
      } catch {
        errors.downloadUrl = '请输入有效的URL地址';
      }
    }

    // 验证分类
    const categoryIds = Array.from(formData.getAll('categoryIds[]'));
    if (categoryIds.length === 0) {
      errors.categories = '请至少选择一个分类';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // 处理缩略图URL
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    if (thumbnailUrl && thumbnailUrl.trim()) {
      // 直接使用文件名，让后端处理路径
      formData.set('thumbnailUrl', thumbnailUrl.trim());
    }

    // 处理多选的分类和标签
    const categoryIds = Array.from(form.querySelectorAll('input[name="categories"]:checked')).map(
      (input) => (input as HTMLInputElement).value
    );
    const tagIds = Array.from(form.querySelectorAll('input[name="tags"]:checked')).map(
      (input) => (input as HTMLInputElement).value
    );

    formData.delete('categories');
    formData.delete('tags');
    categoryIds.forEach(id => formData.append('categoryIds[]', id));
    tagIds.forEach(id => formData.append('tagIds[]', id));

    // 验证表单
    if (!validateForm(formData)) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('提交错误:', error);
      setFormErrors(prev => ({
        ...prev,
        thumbnailUrl: '图片路径格式错误'
      }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型和大小
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, thumbnail: '请上传有效的图片文件' }));
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, thumbnail: '图片大小不能超过5MB' }));
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setFormErrors(prev => ({ ...prev, thumbnail: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
        <p className="text-sm text-red-700 dark:text-red-400">{fetchError}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          游戏标题
        </label>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue={game?.title}
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100 ${
            formErrors.title ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {formErrors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          游戏描述
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={game?.description}
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100 ${
            formErrors.description ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">缩略图</label>
        <div className="mt-1 flex flex-col gap-3">
          {/* 文件上传选项 */}
          <div className="flex items-center space-x-4">
            {thumbnailPreview && (
              <div className="relative h-32 w-48">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  fill
                  className="rounded object-cover"
                />
              </div>
            )}
            <input
              type="file"
              name="thumbnail"
              accept="image/*"
              onChange={handleThumbnailChange}
              className={`block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary-50 file:text-primary-700
                dark:file:bg-primary-900/20 dark:file:text-primary-300
                hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30
                ${formErrors.thumbnail ? 'text-red-600 dark:text-red-400' : ''}`}
            />
          </div>
          
          {/* 或者使用URL链接 */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">或者</span>
            <input
              type="text"
              name="thumbnailUrl"
              placeholder="输入图片文件名，如：example.png"
              defaultValue={game?.thumbnailUrl || ''}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-gray-100 ${
                formErrors.thumbnailUrl ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            推荐尺寸：400 x 300 像素，格式：JPG、PNG（小于2MB）
          </p>
        </div>
        {formErrors.thumbnail && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.thumbnail}</p>
        )}
        {formErrors.thumbnailUrl && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.thumbnailUrl}</p>
        )}
      </div>

      <div>
        <label htmlFor="gameUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          下载链接
        </label>
        <input
          type="text"
          name="gameUrl"
          id="gameUrl"
          defaultValue={game?.gameUrl || ''}
          placeholder="https://example.com/game"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          游戏分类
        </label>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="checkbox"
                name="categories"
                value={category.id}
                defaultChecked={game?.categoryIds.includes(category.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
            </label>
          ))}
        </div>
        {formErrors.categories && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.categories}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          游戏标签
        </label>
        <div className="space-y-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center">
              <input
                type="checkbox"
                name="tags"
                value={tag.id}
                defaultChecked={game?.tagIds.includes(tag.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || isFetching}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
} 