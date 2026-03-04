import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSubdomain } from '../contexts/SubdomainContext';
import { useAuth } from '../contexts/AuthContext';
import { useDistrict } from '../hooks/useDistricts';

// Guards
import { ClientAdminGuard } from '../middleware/ClientAdminGuard';

// Auth
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Welcome } from '../pages/Welcome';
import { AcceptInvitation } from '../pages/AcceptInvitation';

// V2 Lazy-loaded Pages
const V2PublicLayout = lazy(() => import('../components/v2/layout/V2PublicLayout').then(m => ({ default: m.V2PublicLayout })));
const V2AdminLayout = lazy(() => import('../components/v2/layout/V2AdminLayout').then(m => ({ default: m.V2AdminLayout })));
const V2GoalsOverview = lazy(() => import('../pages/v2/public/V2GoalsOverview').then(m => ({ default: m.V2GoalsOverview })));
const V2GoalDrillDown = lazy(() => import('../pages/v2/public/V2GoalDrillDown').then(m => ({ default: m.V2GoalDrillDown })));
const V2LaunchTraction = lazy(() => import('../pages/v2/public/V2LaunchTraction').then(m => ({ default: m.V2LaunchTraction })));
const V2AdminDashboard = lazy(() => import('../pages/v2/admin/V2AdminDashboard').then(m => ({ default: m.V2AdminDashboard })));
const V2PlanEditor = lazy(() => import('../pages/v2/admin/V2PlanEditor').then(m => ({ default: m.V2PlanEditor })));
const V2Appearance = lazy(() => import('../pages/v2/admin/V2Appearance').then(m => ({ default: m.V2Appearance })));
const V2Team = lazy(() => import('../pages/v2/admin/V2Team').then(m => ({ default: m.V2Team })));
const V2WidgetBuilder = lazy(() => import('../pages/v2/admin/V2WidgetBuilder').then(m => ({ default: m.V2WidgetBuilder })));
const V2Import = lazy(() => import('../pages/v2/admin/V2Import').then(m => ({ default: m.V2Import })));
const V2GoalDetail = lazy(() => import('../pages/v2/admin/V2GoalDetail').then(m => ({ default: m.V2GoalDetail })));

const SuspenseFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" />
  </div>
);

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
 * Renders the appropriate public index page based on the district's template_mode.
 */
function PublicIndexPage() {
  const { slug } = useSubdomain();
  const { data: district, isLoading } = useDistrict(slug || '');

  if (isLoading) return null;

  if (district?.template_mode === 'launch-traction') {
    return (
      <Suspense fallback={null}>
        <V2LaunchTraction />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <V2GoalsOverview />
    </Suspense>
  );
}

/**
 * Router for district subdomains (e.g., westside.stratadash.org)
 * The district slug is derived from the subdomain, not URL path.
 */
export function DistrictRouter() {
  const { slug } = useSubdomain();

  // If no slug detected, redirect to root domain
  if (!slug) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/welcome" element={<RequireAuth><Welcome /></RequireAuth>} />
      <Route path="/invite/:token" element={<AcceptInvitation />} />

      {/* Public Routes */}
      <Route path="/" element={<Suspense fallback={SuspenseFallback}><V2PublicLayout /></Suspense>}>
        <Route index element={<PublicIndexPage />} />
        <Route path="goals/:goalId" element={<Suspense fallback={null}><V2GoalDrillDown /></Suspense>} />
        <Route path="launch" element={<Suspense fallback={null}><V2LaunchTraction /></Suspense>} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ClientAdminGuard districtSlug={slug}>
            <Suspense fallback={SuspenseFallback}>
              <V2AdminLayout />
            </Suspense>
          </ClientAdminGuard>
        }
      >
        <Route index element={<Suspense fallback={null}><V2AdminDashboard /></Suspense>} />
        <Route path="plans" element={<Suspense fallback={null}><V2PlanEditor /></Suspense>} />
        <Route path="appearance" element={<Suspense fallback={null}><V2Appearance /></Suspense>} />
        <Route path="team" element={<Suspense fallback={null}><V2Team /></Suspense>} />
        <Route path="widgets" element={<Suspense fallback={null}><V2WidgetBuilder /></Suspense>} />
        <Route path="import" element={<Suspense fallback={null}><V2Import /></Suspense>} />
        <Route path="goals/:goalId" element={<Suspense fallback={null}><V2GoalDetail /></Suspense>} />
      </Route>

      {/* Catch-all redirects to district home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
