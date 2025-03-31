import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EditGameClient from './EditGameClient';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: '编辑游戏 - 管理员后台',
  description: '编辑游戏信息，包括标题、描述、图片等',
};

export default async function EditGamePage({ params }: { params: { id: string } }) {
  // 获取游戏数据
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: {
      tag: true,
    },
  });

  if (!game) {
    notFound();
  }

  // 获取所有分类
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // 获取所有标签
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });

  // 创建一个包含必要结构的游戏对象
  const gameWithCategories = {
    ...game,
    // schema中使用的是category字段(字符串)而不是categories(关系)
    // 为了与EditGameClient兼容，我们模拟一个categories数组
    categories: [{
      id: '0',
      name: game.category
    }]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">编辑游戏</h1>
        <p className="text-gray-600">修改游戏信息和配置</p>
      </div>

      <EditGameClient 
        gameId={params.id} 
        initialData={{
          game: gameWithCategories,
          categories,
          tags
        }}
      />
    </div>
  );
}