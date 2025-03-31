'use client';

import { useState, useRef } from 'react';
import { Share2, Facebook, Twitter, Link2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GameShareButtonProps {
  title: string;
  slug: string;
  stopPropagation?: boolean;
}

export default function GameShareButton({ title, slug, stopPropagation = true }: GameShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // 生成完整的游戏URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sprunkin.com';
  const gameUrl = `${baseUrl}/game/${slug}`;
  
  // 为各个平台生成分享链接
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`玩 ${title} - 斯普伦金`)}&url=${encodeURIComponent(gameUrl)}`,
  };
  
  // 处理分享按钮点击
  const handleShareClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    setShowOptions(!showOptions);
  };
  
  // 复制链接到剪贴板
  const copyToClipboard = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    navigator.clipboard.writeText(gameUrl).then(() => {
      setCopied(true);
      toast.success('链接已复制');
      setTimeout(() => {
        setCopied(false);
        setShowOptions(false);
      }, 2000);
    });
  };
  
  // 处理社交媒体分享
  const handleSocialShare = (e: React.MouseEvent, url: string) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.open(url, '_blank', 'width=600,height=400');
    setShowOptions(false);
  };
  
  // 处理点击外部关闭选项
  const handleClickOutside = (e: MouseEvent) => {
    if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
      setShowOptions(false);
    }
  };
  
  // 添加和移除事件监听器
  useState(() => {
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <div className="relative">
      <button
        onClick={handleShareClick}
        className="flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-md transition-colors"
        aria-label="分享游戏"
      >
        <Share2 size={14} />
      </button>
      
      {showOptions && (
        <div 
          ref={optionsRef}
          className="absolute top-full right-0 mt-2 bg-white rounded-md shadow-lg z-10 w-36 overflow-hidden"
        >
          <div className="p-1">
            <button
              onClick={(e) => handleSocialShare(e, shareLinks.facebook)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
            >
              <Facebook size={14} className="text-[#1877F2]" />
              <span className="text-sm">Facebook</span>
            </button>
            <button
              onClick={(e) => handleSocialShare(e, shareLinks.twitter)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
            >
              <Twitter size={14} className="text-[#1DA1F2]" />
              <span className="text-sm">Twitter</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Link2 size={14} />}
              <span className="text-sm">{copied ? '已复制' : '复制链接'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 