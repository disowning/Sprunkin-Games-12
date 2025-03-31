import { NextAuthProvider } from '@/components/NextAuthProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Gaming Platform',
  description: 'Sign in or create an account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NextAuthProvider>
        {children}
      </NextAuthProvider>
    </div>
  );
}
