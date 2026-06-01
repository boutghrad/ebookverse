'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [mounted, status, router]);

  // Auto-refresh session when authenticated but not admin
  // This ensures role changes in the database are picked up immediately
  useEffect(() => {
    if (mounted && status === 'authenticated' && session?.user) {
      const isAdmin = (session.user as Record<string, unknown>)?.role === 'ADMIN';
      if (!isAdmin) {
        // Force session refresh to pick up role changes from DB
        update();
      }
    }
  }, [mounted, status, session, update]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-violet-500" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const isAdmin = (session?.user as Record<string, unknown>)?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
          <div className="flex items-center justify-center size-20 rounded-full bg-destructive/10">
            <ShieldAlert className="size-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to access the admin dashboard. Only administrators can view this page.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={async () => {
                setRefreshing(true);
                try {
                  await update();
                  router.refresh();
                } finally {
                  setRefreshing(false);
                }
              }}
              disabled={refreshing}
              variant="outline"
              className="w-full"
            >
              {refreshing ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="size-4 mr-2" />
              )}
              Refresh Session
            </Button>
            <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
              <Link href="/">Back to Store</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={30} refetchOnWindowFocus={true}>
      <AdminGuard>{children}</AdminGuard>
    </SessionProvider>
  );
}
