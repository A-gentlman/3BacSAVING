'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { AppProvider } from '@/lib/AppContext';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%' }} />
      </div>
    );
  }

  // If we're on auth pages, just render children (the pages themselves)
  if (!user && (pathname === '/login' || pathname === '/signup')) {
    return <>{children}</>;
  }

  // If we have a user, wrap in AppProvider for data state
  if (user) {
    return (
      <AppProvider key={user.id} currentUser={user.id}>
        {children}
      </AppProvider>
    );
  }

  return null;
}
