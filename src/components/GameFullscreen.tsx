'use client';

import { useRef, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface GameFullscreenProps {
  gameUrl: string;
  gameId: string;
}

// 为用户会话创建一个持久的会话ID
const getSessionId = () => {
  if (typeof window !== 'undefined') {
    // 尝试从localStorage获取sessionId
    let sessionId = localStorage.getItem('gameSessionId');
    
    // 如果不存在，创建一个新的并保存
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('gameSessionId', sessionId);
    }
    
    return sessionId;
  }
  
  return uuidv4(); // 如果在服务器端运行，返回一个新的ID
};

export function GameFullscreen({ gameUrl, gameId }: GameFullscreenProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const sessionId = getSessionId();

  // 记录游戏开始
  useEffect(() => {
    if (gameId && !startTime) {
      setStartTime(Date.now());
      setIsPlaying(true);
      
      // 创建游戏游玩记录
      const recordGamePlay = async () => {
        try {
          await fetch('/api/gameplay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              gameId,
              sessionId,
              duration: 0 // 初始持续时间为0，将在游戏结束时更新
            })
          });
        } catch (error) {
          console.error('Failed to record game play:', error);
        }
      };
      
      recordGamePlay();
    }
    
    // 组件卸载时记录游戏结束
    return () => {
      if (isPlaying && startTime) {
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000); // 转换为秒
        
        // 更新游戏游玩记录
        const updateGamePlay = async () => {
          try {
            await fetch('/api/gameplay', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                gameId,
                sessionId,
                duration
              })
            });
          } catch (error) {
            console.error('Failed to update game play duration:', error);
          }
        };
        
        updateGamePlay();
      }
    };
  }, [gameId, sessionId, startTime, isPlaying]);

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
        全屏游戏
      </button>
    </div>
  );
} 