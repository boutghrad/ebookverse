import { Suspense } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin size-8 border-4 border-violet-500 border-t-transparent rounded-full" /></div>}>{children}</Suspense>;
}
