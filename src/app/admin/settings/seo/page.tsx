import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SeoSettingsForm from '@/app/admin/seo/_components/SeoSettingsForm';

export const metadata: Metadata = {
  title: 'SEO 设置 - 管理后台',
  description: '管理网站SEO元数据、关键词及其他搜索引擎优化设置',
};

export default async function SeoSettingsPage() {
  const session = await getServerSession(authOptions);
  
  // 检查用户权限
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }
  
  // 获取现有的SEO配置
  const seoSetting = await prisma.sitesettings.findFirst({
    where: {
      key: 'seoSettings'
    }
  });
  
  let seoConfig = {};
  
  if (seoSetting) {
    try {
      seoConfig = JSON.parse(seoSetting.value);
    } catch (error) {
      console.error('Error parsing SEO settings:', error);
    }
  }
  
  // 使用默认值填充缺失的字段
  const defaultValues = {
    homeSeoTitle: '精选游戏推荐 - 最新最热门的免费在线游戏',
    homeSeoDescription: '探索我们精心挑选的热门游戏，即刻体验无限乐趣，完全免费！',
    homeSeoKeywords: '在线游戏,免费游戏,HTML5游戏,休闲游戏,益智游戏',
    
    gameSeoTitle: '立即玩 {game_title} - 免费在线游戏',
    gameSeoDescription: '免费在线玩{game_title}，无需下载，即点即玩。{game_title}是一款好玩的{game_category}游戏。',
    
    categorySeoTitle: '{category_name}游戏 - 免费在线{category_name}游戏合集',
    categorySeoDescription: '探索我们精选的{category_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
    
    tagSeoTitle: '{tag_name}游戏 - 免费在线{tag_name}游戏合集',
    tagSeoDescription: '探索我们精选的{tag_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
    
    seoSiteName: '游戏平台',
    
    siteVerificationGoogle: '',
    siteVerificationBaidu: '',
    siteVerificationBing: '',
  };
  
  // 合并默认值和已保存的配置
  const initialValues = { ...defaultValues, ...seoConfig as Record<string, string> };
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SEO 设置</h1>
      <p className="text-gray-600 mb-8">优化网站在搜索引擎中的排名与展示效果</p>
      
      <SeoSettingsForm initialValues={initialValues} />
    </div>
  );
} 