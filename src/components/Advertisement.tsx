'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

interface AdvertisementProps {
  location: string;
  className?: string;
}

interface Ad {
  id: string;
  name: string;
  location: string;
  adType: string;
  adCode: string;
  isActive: boolean;
  order: number;
  startDate: string | null;
  endDate: string | null;
}

export default function Advertisement({ location, className = '' }: AdvertisementProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取该位置的广告
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/advertisements?location=' + location);
        const data = await response.json();
        
        if (data.advertisements) {
          setAds(data.advertisements);
        }
      } catch (error) {
        console.error('Failed to load advertisements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [location]);

  // 如果没有广告或正在加载，返回空div
  if (loading || ads.length === 0) {
    return <div className={`ad-placeholder ${className}`}></div>;
  }

  // 获取当前位置排序最靠前的一个有效广告
  const activeAd = ads[0];

  return (
    <div 
      className={`advertisement ${className}`}
      data-ad-location={location}
      data-ad-id={activeAd.id}
    >
      {/* 使用dangerouslySetInnerHTML显示广告代码 */}
      <div 
        dangerouslySetInnerHTML={{ __html: activeAd.adCode }} 
      />
      
      {/* 对于谷歌广告，确保脚本被正确加载 */}
      {activeAd.adType === 'google_adsense' && (
        <Script
          id={`ad-script-${activeAd.id}`}
          strategy="afterInteractive"
          onError={(e) => {
            console.error('Advertisement script failed to load:', e);
          }}
        >
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </Script>
      )}
    </div>
  );
} 