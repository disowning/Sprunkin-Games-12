'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Link2, MessageCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
}

export default function SocialShare({ title, url, description, imageUrl }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  // 为每个社交平台生成分享链接
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    pinterest: imageUrl ? `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}` : null,
  };

  // 复制链接到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Share Game</h3>
      
      <div className="flex flex-wrap gap-3">
        {/* Facebook */}
        <a 
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-opacity-90 transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook size={18} />
          <span className="hidden sm:inline">Facebook</span>
        </a>
        
        {/* Twitter */}
        <a 
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-md hover:bg-opacity-90 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter size={18} />
          <span className="hidden sm:inline">Twitter</span>
        </a>
        
        {/* LinkedIn */}
        <a 
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-md hover:bg-opacity-90 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin size={18} />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
        
        {/* Reddit */}
        <a 
          href={shareLinks.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] text-white rounded-md hover:bg-opacity-90 transition-colors"
          aria-label="Share on Reddit"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">Reddit</span>
        </a>
        
        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          aria-label="Copy link"
        >
          {copied ? <Check size={18} /> : <Link2 size={18} />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
        </button>
      </div>
      
      {/* 分享提示 */}
      <p className="text-sm text-gray-500 mt-2">
        Help more players discover this game by sharing!
      </p>
    </div>
  );
} 