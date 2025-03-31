'use client';

import { useState, useEffect } from 'react';
import GameForm from '@/components/admin/GameForm';

interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  gameUrl: string;
  categories: { id: string; name: string }[];
  tag: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Props {
  gameId: string;
  initialData: {
    game: Game;
    categories: Category[];
    tags: Tag[];
  };
}

export default function EditGameClient({ gameId, initialData }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  if (!isLoaded) {
    return <div className="p-8 flex justify-center">加载中...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">编辑游戏</h1>
      <GameForm 
        game={initialData.game}
        categories={initialData.categories}
        tags={initialData.tags}
      />
    </div>
  );
}