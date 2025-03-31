'use client';

import { useState } from 'react';
import { Maximize, ThumbsUp } from 'lucide-react';

interface GamePlayerProps {
  gameUrl: string;
  gameTitle: string;
  slug?: string;
  thumbnailUrl?: string;
}

export default function GamePlayer({ gameUrl, gameTitle, slug, thumbnailUrl }: GamePlayerProps) {
  const [liked, setLiked] = useState(false);
  
  const handleFullscreen = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };
  
  const handleLike = () => {
    setLiked(!liked);
    // 这里可以添加实际的点赞逻辑，如 API 调用
  };
  
  return (
    <div className="flex-grow flex items-center justify-center bg-black p-4">
      <div className="relative w-full max-w-5xl aspect-[16/9]">
        <iframe
          src={gameUrl}
          title={`Play ${gameTitle}`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
        
        <button
          onClick={handleFullscreen}
          className="absolute bottom-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white p-2 rounded-full"
          title="Fullscreen"
        >
          <Maximize size={20} />
        </button>
      </div>
    </div>
  );
} 