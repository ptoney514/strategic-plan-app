import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSubdomain } from '../contexts/SubdomainContext';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { ClientPublicLayout } from '../layouts/ClientPublicLayout';
import { ClientAdminLayout } from '../layouts/ClientAdminLayout';

// Guards
import { ClientAdminGuard } from '../middleware/ClientAdminGuard';
import { SchoolAdminGuard } from '../middleware/SchoolAdminGuard';

// Public Pages (New sidebar design)
import { Dashboard } from '../pages/client/public/Dashboard';
import { ObjectiveDetail } from '../pages/client/public/ObjectiveDetail';
import { GoalDetailNew } from '../pages/client/public/GoalDetailNew';

// Public Pages (Legacy)
import { DistrictDashboard } from '../pages/client/public/DistrictDashboard';
import { GoalDetail } from '../pages/client/public/GoalDetail';
import { MetricsDashboard } from '../pages/client/public/MetricsDashboard';
import { SchoolsDirectory } from '../pages/client/public/SchoolsDirectory';
import { DistrictLandingPage } from '../pages/client/public/DistrictLandingPage';

// Admin Pages
import { AdminGoals } from '../pages/client/admin/AdminGoals';
import { AdminSettings } from '../pages/client/admin/AdminSettings';
import { ObjectiveBuilder } from '../pages/client/admin/ObjectiveBuilder';
import { AdminDashboard2 } from '../pages/client/admin/AdminDashboard2';
import { CreateObjective } from '../pages/client/admin/CreateObjective';
import { EditObjective } from '../pages/client/admin/EditObjective';
import { ObjectiveDetail as AdminObjectiveDetail } from '../pages/client/admin/ObjectiveDetail';
import { TeamMembers } from '../pages/client/admin/TeamMembers';
import { DistrictAppearance } from '../pages/client/admin/DistrictAppearance';
import { VisualLibrary } from '../pages/client/admin/VisualLibrary';
import { PlansList } from '../pages/client/admin/PlansList';
import { CreatePlan } from '../pages/client/admin/CreatePlan';
import { EditPlan } from '../pages/client/admin/EditPlan';
import { PlanDetail } from '../pages/client/admin/PlanDetail';

// School Admin Pages
import {
  SchoolDashboard,
  SchoolObjectives,
  SchoolUsers,
  SchoolAppearance,
} from '../pages/client/admin/school';

// Auth
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Welcome } from '../pages/Welcome';
import { AcceptInvitation } from '../pages/AcceptInvitation';

// Dashboard Pages
import { DistrictAdminDashboard } from '../pages/client/admin/DistrictAdminDashboard';

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

      {/* Public Routes (New sidebar design) - Main entry point */}
      <Route path="/" element={<PublicLayout districtSlug={slug} />}>
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Dashboard />} />
        <Route path="objective/:goalId" element={<ObjectiveDetail />} />
        <Route path="goal/:goalId" element={<GoalDetailNew />} />
      </Route>

      {/* Legacy Public Routes - kept for compatibility */}
      <Route path="/goals" element={<ClientPublicLayout districtSlug={slug} />}>
        <Route index element={<DistrictDashboard />} />
        <Route path=":goalId" element={<GoalDetail />} />
      </Route>
      <Route path="/metrics" element={<ClientPublicLayout districtSlug={slug} />}>
        <Route index element={<MetricsDashboard />} />
      </Route>
      <Route path="/landing" element={<DistrictLandingPage />} />

      {/* Schools Routes */}
      <Route path="/schools" element={<ClientPublicLayout districtSlug={slug} />}>
        <Route index element={<SchoolsDirectory />} />
      </Route>
      <Route path="/schools/:schoolSlug" element={<ClientPublicLayout districtSlug={slug} />}>
        <Route index element={<div>School Landing Page - Coming Soon</div>} />
        <Route path="goals" element={<div>School Dashboard - Coming Soon</div>} />
        <Route path="goals/:goalId" element={<GoalDetail />} />
      </Route>

      {/* School Admin Routes */}
      <Route
        path="/schools/:schoolSlug/admin"
        element={
          <SchoolAdminGuard districtSlug={slug}>
            <ClientAdminLayout />
          </SchoolAdminGuard>
        }
      >
        <Route index element={<SchoolDashboard />} />
        <Route path="objectives" element={<SchoolObjectives />} />
        <Route path="objectives/new" element={<ObjectiveBuilder />} />
        <Route path="objectives/:objectiveId" element={<AdminObjectiveDetail />} />
        <Route path="objectives/:objectiveId/edit" element={<ObjectiveBuilder />} />
        <Route path="users" element={<SchoolUsers />} />
        <Route path="appearance" element={<SchoolAppearance />} />
        <Route path="settings" element={<AdminSettings />} />
        {/* Legacy redirects */}
        <Route path="goals" element={<AdminGoals />} />
      </Route>

      {/* District Admin Routes (Unified Editorial Layout) */}
      <Route
        path="/admin"
        element={
          <ClientAdminGuard districtSlug={slug}>
            <ClientAdminLayout />
          </ClientAdminGuard>
        }
      >
        <Route index element={<DistrictAdminDashboard />} />
        {/* Objectives/Goals routes */}
        <Route path="objectives" element={<AdminDashboard2 />} />
        <Route path="objectives/create" element={<CreateObjective />} />
        <Route path="objectives/:objectiveId" element={<AdminObjectiveDetail />} />
        <Route path="objectives/:objectiveId/edit" element={<EditObjective />} />
        {/* Plans routes */}
        <Route path="plans" element={<PlansList />} />
        <Route path="plans/create" element={<CreatePlan />} />
        <Route path="plans/:planId" element={<PlanDetail />} />
        <Route path="plans/:planId/edit" element={<EditPlan />} />
        {/* District-level pages */}
        <Route path="users" element={<TeamMembers />} />
        <Route path="appearance" element={<DistrictAppearance />} />
        <Route path="visuals" element={<VisualLibrary />} />
        <Route path="settings" element={<AdminSettings />} />
        {/* Backwards compatibility redirects */}
        <Route path="goals" element={<Navigate to="../objectives" replace />} />
        <Route path="objectives/new" element={<Navigate to="../objectives/create" replace />} />
        {/* Redirect old placeholder routes to admin home */}
        <Route path="metrics" element={<Navigate to="/admin" replace />} />
        <Route path="dashboards" element={<Navigate to="/admin" replace />} />
        <Route path="reports" element={<Navigate to="/admin" replace />} />
        <Route path="invite" element={<Navigate to="/admin/users" replace />} />
        <Route path="help" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Redirect /admin2 to /admin for backwards compatibility */}
      <Route path="/admin2" element={<Navigate to="/admin" replace />} />
      <Route path="/admin2/*" element={<Navigate to="/admin" replace />} />

      {/* V2 Public Routes */}
      <Route path="/v2" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" /></div>}><V2PublicLayout /></Suspense>}>
        <Route index element={<Suspense fallback={null}><V2GoalsOverview /></Suspense>} />
        <Route path="goals/:goalId" element={<Suspense fallback={null}><V2GoalDrillDown /></Suspense>} />
        <Route path="launch" element={<Suspense fallback={null}><V2LaunchTraction /></Suspense>} />
      </Route>

      {/* V2 Admin Routes */}
      <Route
        path="/v2/admin"
        element={
          <ClientAdminGuard districtSlug={slug}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" /></div>}>
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

      {/* Catch-all redirects to district dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
