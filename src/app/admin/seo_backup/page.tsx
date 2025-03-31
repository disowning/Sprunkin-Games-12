import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SeoSettingsForm from '../seo/_components/SeoSettingsForm';

export const metadata: Metadata = {
  title: 'SEO 管理 - 游戏平台',
  description: '管理网站SEO元数据、关键词及其他搜索引擎优化设置',
};

export default async function SeoSettingsPage() {
  const session = await getServerSession(authOptions);
  
  // 检查用户权限
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }
  
  // 获取现有SEO配置
  const configs = await prisma.siteconfig.findMany({
    where: {
      key: {
        in: ['home_seo_title', 'home_seo_description', 'game_seo_title']
      }
    }
  });
  
  // 转换为键值对形式
  const configMap = configs.reduce((acc: Record<string, string>, config) => {
    acc[config.key] = config.value;
    return acc;
  }, {});
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SEO 管理</h1>
      <p className="text-gray-600 mb-8">优化网站在搜索引擎中的排名与展示效果</p>
      
      <SeoSettingsForm 
        initialValues={{
          homeSeoTitle: configMap.home_seo_title || '精选游戏推荐 - 最新最热门的免费在线游戏',
          homeSeoDescription: configMap.home_seo_description || '探索我们精心挑选的热门游戏，即刻体验无限乐趣，完全免费！',
          homeSeoKeywords: configMap.home_seo_keywords || '在线游戏,免费游戏,HTML5游戏,休闲游戏,益智游戏',
          
          gameSeoTitle: configMap.game_seo_title || '立即玩 {game_title} - 免费在线游戏',
          gameSeoDescription: configMap.game_seo_description || '免费在线玩{game_title}，无需下载，即点即玩。{game_title}是一款好玩的{game_category}游戏。',
          
          categorySeoTitle: configMap.category_seo_title || '{category_name}游戏 - 免费在线{category_name}游戏合集',
          categorySeoDescription: configMap.category_seo_description || '探索我们精选的{category_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
          
          tagSeoTitle: configMap.tag_seo_title || '{tag_name}游戏 - 免费在线{tag_name}游戏合集',
          tagSeoDescription: configMap.tag_seo_description || '探索我们精选的{tag_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
          
          seoSiteName: configMap.seo_site_name || '游戏平台',
          
          // 站点验证
          siteVerificationGoogle: configMap.site_verification_google || '',
          siteVerificationBaidu: configMap.site_verification_baidu || '',
          siteVerificationBing: configMap.site_verification_bing || '',
        }}
      />
    </div>
  );
} 