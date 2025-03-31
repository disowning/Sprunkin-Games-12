import prisma from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 基础URLs - 固定页面
  const baseUrls = [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/games`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ] as MetadataRoute.Sitemap;

  try {
    // 获取所有游戏
    const games = await prisma.game.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const gameUrls = games.map((game) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/games/${game.slug}`,
      lastModified: game.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })) as MetadataRoute.Sitemap;

    // 获取所有分类
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const categoryUrls = categories.map((category) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })) as MetadataRoute.Sitemap;

    // 获取所有标签
    const tags = await prisma.tag.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const tagUrls = tags.map((tag) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tag/${tag.slug}`,
      lastModified: tag.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    })) as MetadataRoute.Sitemap;

    // 合并所有URL
    return [...baseUrls, ...gameUrls, ...categoryUrls, ...tagUrls];
  } catch (error) {
    console.error('生成网站地图时出错:', error);
    return baseUrls;
  }
} 