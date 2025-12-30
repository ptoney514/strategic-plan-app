import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }

  // Redirect to home if not a system admin
  if (!isSystemAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
