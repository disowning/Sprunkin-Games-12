'use client';

import { ReactNode } from 'react';

interface SEOLayoutProps {
  children: ReactNode;
}

export default function SEOLayout({ children }: SEOLayoutProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto py-10">
        {/* SEO页面主内容 */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {children}
        </div>
        
        {/* SEO说明信息 */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
            SEO设置说明
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-200 mb-4">
            良好的SEO设置可以帮助您的网站在搜索引擎中获得更好的排名和展示效果。
          </p>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-medium">标题 (Title)</h4>
              <p>
                页面标题是搜索引擎排名的重要因素，应该包含您的关键词，同时保持简洁明了。
                建议长度：50-60个字符。
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">描述 (Description)</h4>
              <p>
                描述会显示在搜索结果中，应该准确概括页面内容并吸引用户点击。
                建议长度：150-160个字符。
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">关键词 (Keywords)</h4>
              <p>
                虽然现代搜索引擎不再严重依赖meta keywords，但添加一些相关关键词仍然有助于内容索引。
                建议使用5-10个与页面内容相关的关键词，用英文逗号分隔。
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">变量使用</h4>
              <p>
                在模板中可以使用占位符：
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{'{game_title}'}</code>,
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{'{game_category}'}</code>,
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{'{category_name}'}</code>,
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{'{tag_name}'}</code>
                等，这些会在页面加载时自动替换为相应的内容。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 