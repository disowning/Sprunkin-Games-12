'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGameRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/games/new');
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">正在跳转到添加游戏页面...</p>
      </div>
    </div>
  );
} 