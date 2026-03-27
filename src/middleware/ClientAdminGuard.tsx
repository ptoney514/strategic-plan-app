'use client'
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ClientAdminGuardProps {
  children: ReactNode;
  /** Optional: For subdomain-based routing, pass the slug directly */
  districtSlug?: string;
}

/**
 * ClientAdminGuard - Protects client admin routes
 * Only allows access to users with admin rights for the specific district
 *
 * Usage:
 * <ClientAdminGuard>
 *   <ClientAdminLayout />
 * </ClientAdminGuard>
 *
 * With subdomain routing:
 * <ClientAdminGuard districtSlug="westside">
 *   <ClientAdminLayout />
 * </ClientAdminGuard>
 */
export function ClientAdminGuard({ children, districtSlug }: ClientAdminGuardProps) {
  const params = useParams<{ slug: string }>();
  // Use prop if provided (subdomain routing), otherwise use URL param (path routing)
  // Next.js useParams returns string | string[] for dynamic segments
  const paramSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = districtSlug || paramSlug;
  const { isAuthenticated, loading: authLoading, hasDistrictAccess } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!slug) {
        setHasAccess(false);
        setChecking(false);
        return;
      }

      if (authLoading) {
        return; // Wait for auth to finish loading
      }

      if (!isAuthenticated) {
        setHasAccess(false);
        setChecking(false);
        return;
      }

      try {
        const access = await hasDistrictAccess(slug);
        setHasAccess(access);
      } catch (error) {
        console.error('[ClientAdminGuard] Error checking access:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, [slug, isAuthenticated, authLoading, hasDistrictAccess]);

  // Show loading state while checking auth
  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  // Redirect to public view if no admin access
  if (hasAccess === false) {
    router.replace(`/${slug}`);
    return null;
  }

  return <>{children}</>;
}
