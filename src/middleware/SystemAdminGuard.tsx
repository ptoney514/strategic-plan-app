'use client'
import { type ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getSubdomainUrl } from '../lib/subdomain';

interface SystemAdminGuardProps {
  children: ReactNode;
}

/**
 * SystemAdminGuard - Protects system admin routes
 * Only allows access to users with system administrator role
 *
 * Usage:
 * <SystemAdminGuard>
 *   <SystemAdminLayout />
 * </SystemAdminGuard>
 */
export function SystemAdminGuard({ children }: SystemAdminGuardProps) {
  const { isAuthenticated, isSystemAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to root domain if not a system admin
  // Using window.location.href because router would stay on admin subdomain
  useEffect(() => {
    if (!loading && isAuthenticated && !isSystemAdmin) {
      window.location.href = getSubdomainUrl('root');
    }
  }, [loading, isAuthenticated, isSystemAdmin]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const search = searchParams.toString();
      const loginPath = `/login${search ? `?${search}` : ''}`;
      router.replace(loginPath);
    }
  }, [loading, isAuthenticated, router, searchParams]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isSystemAdmin) {
    return null;
  }

  return <>{children}</>;
}
