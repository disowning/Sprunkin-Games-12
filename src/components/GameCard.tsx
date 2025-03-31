import Image from 'next/image'
import Link from 'next/link'

export default function GameCard({ game }: { game: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="relative h-48">
        <Image
          src={game.thumbnailUrl}
          alt={game.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {game.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {game.categories.map((category: any) => (
            <span
              key={category.id}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
            >
              {category.name}
            </span>
          ))}
        </div>
        <Link
          href={`/games/${game.slug}`}
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Play Game
        </Link>
      </div>
    </div>
  )
} 