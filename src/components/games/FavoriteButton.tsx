'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
  gameId: string;
  isFavorited: boolean;
  favoritesCount: number;
}

export default function FavoriteButton({
  gameId,
  isFavorited: initialIsFavorited,
  favoritesCount: initialFavoritesCount,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          action: isFavorited ? 'unfavorite' : 'favorite',
        }),
      });

      if (!response.ok) {
        throw new Error('操作失败');
      }

      setIsFavorited(!isFavorited);
      setFavoritesCount(
        isFavorited ? favoritesCount - 1 : favoritesCount + 1
      );
      router.refresh();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
        isFavorited
          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <svg
        className={`w-5 h-5 ${
          isFavorited ? 'fill-current' : 'stroke-current fill-none'
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-sm font-medium">
        {isLoading ? '处理中...' : `${favoritesCount} 收藏`}
      </span>
    </button>
  );
}