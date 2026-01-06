import { Routes, Route, Navigate } from 'react-router-dom';
import { useSubdomain } from '../contexts/SubdomainContext';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { ClientPublicLayout } from '../layouts/ClientPublicLayout';
import { ClientAdminLayout } from '../layouts/ClientAdminLayout';
import { ClientAdminEditorialLayout } from '../layouts/ClientAdminEditorialLayout';

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
import { AdminDashboard } from '../pages/client/admin/AdminDashboard';
import { AdminGoals } from '../pages/client/admin/AdminGoals';
import AdminGoalsV2 from '../pages/client/admin/AdminGoalsV2';
import { AdminAudit } from '../pages/client/admin/AdminAudit';
import { AdminSettings } from '../pages/client/admin/AdminSettings';
import { ObjectiveBuilder } from '../pages/client/admin/ObjectiveBuilder';
import { ImportWizard } from '../pages/client/admin/ImportWizard';
import { AdminSchools } from '../pages/client/admin/AdminSchools';
import { DataManager } from '../pages/client/admin/DataManager';
import { AdminDashboard2 } from '../pages/client/admin/AdminDashboard2';
import { CreateObjective } from '../pages/client/admin/CreateObjective';
import { EditObjective } from '../pages/client/admin/EditObjective';

// Auth
import { Login } from '../pages/Login';

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
      {/* Login */}
      <Route path="/login" element={<Login />} />

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
        <Route index element={<div>School Admin Dashboard - Coming Soon</div>} />
        <Route path="goals" element={<AdminGoals />} />
        <Route path="objectives/new" element={<ObjectiveBuilder />} />
        <Route path="objectives/:objectiveId/edit" element={<ObjectiveBuilder />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* District Admin Routes (Editorial Design) */}
      <Route
        path="/admin"
        element={
          <ClientAdminGuard districtSlug={slug}>
            <ClientAdminEditorialLayout />
          </ClientAdminGuard>
        }
      >
        <Route index element={<AdminDashboard2 />} />
        <Route path="objectives" element={<AdminDashboard2 />} />
        <Route path="objectives/create" element={<CreateObjective />} />
        <Route path="objectives/:objectiveId/edit" element={<EditObjective />} />
        {/* Backwards compatibility redirects */}
        <Route path="goals" element={<Navigate to="../objectives" replace />} />
        <Route path="objectives/new" element={<Navigate to="../objectives/create" replace />} />
      </Route>

      {/* Redirect /admin2 to /admin for backwards compatibility */}
      <Route path="/admin2" element={<Navigate to="/admin" replace />} />
      <Route path="/admin2/*" element={<Navigate to="/admin" replace />} />

      {/* Catch-all redirects to district dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
