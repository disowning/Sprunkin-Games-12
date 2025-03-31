'use client';

import { useRef } from 'react';

interface GameFullscreenProps {
  gameUrl: string;
}

export function GameFullscreen({ gameUrl }: GameFullscreenProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <iframe
        ref={iframeRef}
        src={gameUrl}
        className="w-full h-full"
        allow="fullscreen; autoplay; encrypted-media"
        style={{
          border: 'none',
          maxWidth: '960px',
          margin: '0 auto',
          backgroundColor: '#000',
        }}
      />
      <button
        onClick={handleFullscreen}
        className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Fullscreen
      </button>
    </div>
  );
}