'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

interface SeoSettingsFormProps {
  initialValues: {
    homeSeoTitle: string;
    homeSeoDescription: string;
    homeSeoKeywords: string;
    
    gameSeoTitle: string;
    gameSeoDescription: string;
    
    categorySeoTitle: string;
    categorySeoDescription: string;
    
    tagSeoTitle: string;
    tagSeoDescription: string;
    
    seoSiteName: string;
    
    siteVerificationGoogle: string;
    siteVerificationBaidu: string;
    siteVerificationBing: string;
  };
}

export default function SeoSettingsForm({ initialValues }: SeoSettingsFormProps) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          home_seo_title: values.homeSeoTitle,
          home_seo_description: values.homeSeoDescription,
          home_seo_keywords: values.homeSeoKeywords,
          
          game_seo_title: values.gameSeoTitle,
          game_seo_description: values.gameSeoDescription,
          
          category_seo_title: values.categorySeoTitle,
          category_seo_description: values.categorySeoDescription,
          
          tag_seo_title: values.tagSeoTitle,
          tag_seo_description: values.tagSeoDescription,
          
          seo_site_name: values.seoSiteName,
          
          site_verification_google: values.siteVerificationGoogle,
          site_verification_baidu: values.siteVerificationBaidu,
          site_verification_bing: values.siteVerificationBing,
        }),
      });
      
      if (response.ok) {
        toast.success('SEO设置保存成功');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(`保存失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      toast.error('保存失败，请稍后重试');
      console.error('提交SEO设置出错:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <TabsList className="p-2 flex w-full justify-center rounded-none bg-transparent h-auto">
              <TabsTrigger 
                value="home" 
                className="rounded-md h-12 px-10 mx-3 font-medium transition-all hover:bg-white/50 hover:text-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                首页SEO
              </TabsTrigger>
              <TabsTrigger 
                value="page" 
                className="rounded-md h-12 px-10 mx-3 font-medium transition-all hover:bg-white/50 hover:text-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                页面SEO
              </TabsTrigger>
              <TabsTrigger 
                value="verification" 
                className="rounded-md h-12 px-10 mx-3 font-medium transition-all hover:bg-white/50 hover:text-blue-600 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                站点验证
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-8">
            <TabsContent value="home" className="mt-0 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-blue-700 font-medium mb-2">首页SEO优化</h3>
                <p className="text-sm text-blue-600">设置网站首页的SEO信息，帮助搜索引擎更好地理解和展示您的网站内容</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  网站名称
                </label>
                <input
                  type="text"
                  name="seoSiteName"
                  value={values.seoSiteName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">显示在所有页面标题后缀</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  首页SEO标题
                </label>
                <input
                  type="text"
                  name="homeSeoTitle"
                  value={values.homeSeoTitle}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">在首页展示的标题，影响搜索引擎结果显示</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  首页SEO描述
                </label>
                <textarea
                  name="homeSeoDescription"
                  value={values.homeSeoDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">首页的简短描述，会显示在搜索结果中</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  首页SEO关键词
                </label>
                <input
                  type="text"
                  name="homeSeoKeywords"
                  value={values.homeSeoKeywords}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <p className="mt-1 text-sm text-gray-500">关键词用英文逗号分隔，不要过多，一般5-10个为宜</p>
              </div>
            </TabsContent>
            
            <TabsContent value="page" className="mt-0 space-y-6">
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="text-green-700 font-medium mb-2">页面SEO模板设置</h3>
                <p className="text-sm text-green-600">配置游戏页面、分类页面和标签页面的SEO信息模板，使用占位符动态生成页面元数据</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded mr-2">🎮</span>
                  游戏详情页
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      游戏页SEO标题模板
                    </label>
                    <input
                      type="text"
                      name="gameSeoTitle"
                      value={values.gameSeoTitle}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      使用 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{game_title}"}</code> 作为游戏标题的占位符
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      游戏页SEO描述模板
                    </label>
                    <textarea
                      name="gameSeoDescription"
                      value={values.gameSeoDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      可用占位符: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{game_title}"}</code>, 
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs ml-1">{"{game_category}"}</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 p-1 rounded mr-2">📁</span>
                  分类页面
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类页SEO标题模板
                    </label>
                    <input
                      type="text"
                      name="categorySeoTitle"
                      value={values.categorySeoTitle}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      使用 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{category_name}"}</code> 作为分类名称的占位符
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类页SEO描述模板
                    </label>
                    <textarea
                      name="categorySeoDescription"
                      value={values.categorySeoDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      使用 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{category_name}"}</code> 作为分类名称的占位符
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <span className="bg-purple-100 text-purple-800 p-1 rounded mr-2">🏷️</span>
                  标签页面
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签页SEO标题模板
                    </label>
                    <input
                      type="text"
                      name="tagSeoTitle"
                      value={values.tagSeoTitle}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      使用 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{tag_name}"}</code> 作为标签名称的占位符
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签页SEO描述模板
                    </label>
                    <textarea
                      name="tagSeoDescription"
                      value={values.tagSeoDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      使用 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{"{tag_name}"}</code> 作为标签名称的占位符
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="verification" className="mt-0 space-y-6">
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <h3 className="text-indigo-700 font-medium mb-2">搜索引擎站点验证</h3>
                <p className="text-sm text-indigo-600">添加搜索引擎站点验证代码，帮助在搜索引擎工具中验证网站所有权，获取更多管理功能</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Google</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Search Console 验证码
                    </label>
                    <input
                      type="text"
                      name="siteVerificationGoogle"
                      value={values.siteVerificationGoogle}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="例如: ABcDeFGhIJk-LMnOPqrS_TUvwXYZ12345678"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      只需填写content值部分，不需要整个meta标签
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <img src="https://www.baidu.com/favicon.ico" alt="Baidu" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">百度</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      百度搜索资源平台验证码
                    </label>
                    <input
                      type="text"
                      name="siteVerificationBaidu"
                      value={values.siteVerificationBaidu}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="例如: code-AbCdEfGh12"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      百度站长工具中的HTML标签验证码
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <img src="https://www.bing.com/favicon.ico" alt="Bing" className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Bing</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bing Webmaster Tools 验证码
                    </label>
                    <input
                      type="text"
                      name="siteVerificationBing"
                      value={values.siteVerificationBing}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="例如: A1B2C3D4E5F6G7H8I9J0"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Bing网站管理员中心的验证代码
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end p-8 pt-0">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm font-medium flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                保存设置
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
} 