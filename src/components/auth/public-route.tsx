"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // User is authenticated, redirect to dashboard
      const intendedDestination = sessionStorage.getItem('redirectAfterLogin');
      if (intendedDestination) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(intendedDestination);
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if authenticated
  if (user) {
    return null;
  }

  return <>{children}</>;
}
