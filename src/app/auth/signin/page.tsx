'use client';

import { Suspense } from 'react';

import SignInContent from './_components/SignInContent';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}