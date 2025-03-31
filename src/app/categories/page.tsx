import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Game Categories - Sprunkin',
  description: 'Browse all our game categories and discover your favorite game types'
}

export default async function CategoriesPage() {

  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });

  // 然后为每个分类查找相关游戏
const categoriesWithGames = await Promise.all(
  categories.map(async (category) => {
    const gameCount = await prisma.game.count({
      where: { category: category.name }
    });
    
    const previewGame = await prisma.game.findFirst({
      where: { category: category.name },
      select: { thumbnailUrl: true }
    });
    
    return {
      ...category,
      _count: { games: gameCount },
      games: previewGame ? [previewGame] : []
    };
  })
);

  // 获取所有分类及每个分类下的游戏数量
  // const categories = await prisma.category.findMany({
  //   include: {
  //     _count: {
  //       select: {
  //         games: true
  //       }
  //     },
  //     games: {
  //       take: 1,
  //       select: {
  //         thumbnailUrl: true
  //       }
  //     }
  //   },
  //   orderBy: {
  //     name: 'asc'
  //   }
  // });

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Game Categories</h1>
      <p className="text-gray-600 mb-8">
        Browse all game categories to find the types of games that interest you
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categoriesWithGames.map((category) => (
          <Link
            key={category.id}
            href={`/games?category=${category.slug}`}
            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative h-40 bg-gray-200">
              {category.games[0]?.thumbnailUrl ? (
                <Image
                  src={category.games[0].thumbnailUrl}
                  alt={category.name}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-white drop-shadow-md text-center px-4">
                  {category.name}
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {category._count.games} Games
                </span>
                <span className="text-blue-600 font-medium group-hover:underline">
                  View Games →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Categories Available</h2>
          <p className="text-gray-500">
            There are no game categories available at the moment. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
} 