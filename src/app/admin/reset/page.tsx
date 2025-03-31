'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@jx099.com',
          password: '123456'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('重置成功！请使用新密码登录');
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setMessage('重置失败：' + data.error);
      }
    } catch (error) {
      setMessage('重置过程发生错误');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-6">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-xl font-bold">重置管理员密码</h1>
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '处理中...' : '重置管理员密码'}
          </button>
        </div>
      </div>
    </div>
  );
} 