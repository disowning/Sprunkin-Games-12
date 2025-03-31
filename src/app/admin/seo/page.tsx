import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SeoSettingsForm from './_components/SeoSettingsForm';
import SEOLayout from '@/app/layouts/SEOLayout';

export const metadata: Metadata = {
  title: 'SEO设置 - 管理后台',
  description: '管理网站的SEO设置，包括标题、描述、关键词等',
};

export default async function SEOPage() {
  const session = await getServerSession(authOptions);
  
  // 检查用户权限
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }
  
  // 获取所有SEO配置
  const configs = await prisma.siteconfig.findMany({
    where: {
      key: {
        in: [
          'home_seo_title', 
          'home_seo_description', 
          'home_seo_keywords',
          'game_seo_title',
          'game_seo_description',
          'category_seo_title',
          'category_seo_description',
          'tag_seo_title',
          'tag_seo_description',
          'seo_site_name',
          'site_verification_google',
          'site_verification_baidu',
          'site_verification_bing'
        ]
      }
    }
  });
  
  // 转换为键值对形式
  const configMap = configs.reduce((acc: Record<string, string>, config) => {
    acc[config.key] = config.value;
    return acc;
  }, {});

  return (
    <SEOLayout>
      <SeoSettingsForm 
        initialValues={{
          homeSeoTitle: configMap.home_seo_title || '精选游戏推荐 - 最新最热门的免费在线游戏 | 斯普伦金',
          homeSeoDescription: configMap.home_seo_description || '探索我们精心挑选的热门游戏，即刻体验无限乐趣，完全免费！',
          homeSeoKeywords: configMap.home_seo_keywords || '在线游戏,免费游戏,HTML5游戏,休闲游戏,益智游戏',
          
          gameSeoTitle: configMap.game_seo_title || '立即玩 {game_title} - 免费在线游戏 | 斯普伦金',
          gameSeoDescription: configMap.game_seo_description || '免费在线玩{game_title}，无需下载，即点即玩。{game_title}是一款好玩的{game_category}游戏。',
          
          categorySeoTitle: configMap.category_seo_title || '{category_name}游戏 - 免费在线{category_name}游戏合集 | 斯普伦金',
          categorySeoDescription: configMap.category_seo_description || '探索我们精选的{category_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
          
          tagSeoTitle: configMap.tag_seo_title || '{tag_name}游戏 - 免费在线{tag_name}游戏合集 | 斯普伦金',
          tagSeoDescription: configMap.tag_seo_description || '探索我们精选的{tag_name}游戏合集，所有游戏免费在线玩，无需下载，即点即玩。',
          
          seoSiteName: configMap.seo_site_name || '斯普伦金游戏平台',
          
          // 站点验证
          siteVerificationGoogle: configMap.site_verification_google || '',
          siteVerificationBaidu: configMap.site_verification_baidu || '',
          siteVerificationBing: configMap.site_verification_bing || '',
        }} 
      />
    </SEOLayout>
  );
} 