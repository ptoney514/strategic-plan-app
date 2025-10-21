import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SchoolAdminService } from '../lib/services';

interface SchoolAdminGuardProps {
  children: ReactNode;
}

/**
 * SchoolAdminGuard - Protects school admin routes
 * Allows access to users who are:
 * - System admins
 * - District admins for the school's district
 * - School admins for the specific school
 *
 * Usage:
 * <SchoolAdminGuard>
 *   <SchoolAdminLayout />
 * </SchoolAdminGuard>
 */
export function SchoolAdminGuard({ children }: SchoolAdminGuardProps) {
  const { slug, schoolSlug } = useParams<{ slug: string; schoolSlug: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!slug || !schoolSlug) {
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
        const access = await SchoolAdminService.canAccessSchool(slug, schoolSlug);
        setHasAccess(access);
      } catch (error) {
        console.error('[SchoolAdminGuard] Error checking school access:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    }

    checkAccess();
  }, [slug, schoolSlug, isAuthenticated, authLoading]);

  // Show loading state while checking auth
  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying school access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: `/${slug}/schools/${schoolSlug}/admin` }} replace />;
  }

  // Redirect to public school view if no admin access
  if (hasAccess === false) {
    return <Navigate to={`/${slug}/schools/${schoolSlug}`} replace />;
  }

  return <>{children}</>;
}
