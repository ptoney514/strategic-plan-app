import { Routes, Route, Navigate } from 'react-router-dom';
import { MarketingLanding } from '../pages/marketing/Landing';
import { Login } from '../pages/Login';
import { DistrictRedirect } from '../components/DistrictRedirect';
import { AccountSettings } from '../pages/AccountSettings';
import { useAuth } from '../contexts/AuthContext';

/**
 * RequireAuth - Wrapper to protect routes that require authentication
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Router for the root domain (stratadash.org)
 * Handles marketing pages and redirects legacy district paths to subdomains.
 */
export function RootRouter() {
  return (
    <Routes>
      {/* Marketing pages */}
      <Route path="/" element={<MarketingLanding />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/account"
        element={
          <RequireAuth>
            <AccountSettings />
          </RequireAuth>
        }
      />

      {/* Redirect legacy district paths to subdomains */}
      <Route path="/:slug/*" element={<DistrictRedirect />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
