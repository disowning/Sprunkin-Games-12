 'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Game {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
}

interface Props {
  games: Game[];
}

export default function FavoriteGames({ games }: Props) {
  if (games.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400">
        还没有收藏任何游戏
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/games/${game.slug}`}
          className="block group"
        >
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={game.thumbnailUrl}
              alt={game.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {game.title}
          </h3>
        </Link>
      ))}
    </div>
  );
}