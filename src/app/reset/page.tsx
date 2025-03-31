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
      setMessage('Resetting...');
      
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretKey: 'your-secret-key-here' // 添加一个简单的安全验证
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Reset successful! New login credentials:\nEmail: admin@jx099.com\nPassword: 123456');
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/auth/login');
        }, 5000);
      } else {
        setMessage('Reset failed: ' + data.error);
      }
    } catch (error) {
      setMessage('An error occurred during reset');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Reset Admin Account</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded whitespace-pre-line ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 px-4 font-medium
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Reset Admin Account'}
          </button>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            This page is only for resetting the admin account. Please change your password immediately after reset
          </p>
        </div>
      </div>
    </div>
  );
} 