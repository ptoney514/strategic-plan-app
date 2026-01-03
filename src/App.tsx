import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts
import { SystemAdminLayout } from './layouts/SystemAdminLayout';
import { ClientPublicLayout } from './layouts/ClientPublicLayout';
import { ClientAdminLayout } from './layouts/ClientAdminLayout';
import { ClientAdminEditorialLayout } from './layouts/ClientAdminEditorialLayout';
import { PublicLayout } from './layouts/PublicLayout';

// System Admin Pages
import { SystemDashboard } from './pages/admin/SystemDashboard';
import { SystemSettings } from './pages/admin/SystemSettings';

// Client Public Pages
import { HomePage } from './pages/client/public/HomePage';
import { DistrictLandingPage } from './pages/client/public/DistrictLandingPage';
import { DistrictDashboard } from './pages/client/public/DistrictDashboard';
import { GoalDetail } from './pages/client/public/GoalDetail';
import { MetricsDashboard } from './pages/client/public/MetricsDashboard';
import { SchoolsDirectory } from './pages/client/public/SchoolsDirectory';

// New Public Pages (sidebar design)
import { Dashboard } from './pages/client/public/Dashboard';
import { GoalDetailNew } from './pages/client/public/GoalDetailNew';
import { ObjectiveDetail } from './pages/client/public/ObjectiveDetail';

// Client Admin Pages
import { AdminDashboard } from './pages/client/admin/AdminDashboard';
import { AdminGoals } from './pages/client/admin/AdminGoals';
import AdminGoalsV2 from './pages/client/admin/AdminGoalsV2';
import { AdminAudit } from './pages/client/admin/AdminAudit';
import { AdminSettings } from './pages/client/admin/AdminSettings';
import { ObjectiveBuilder } from './pages/client/admin/ObjectiveBuilder';
import { ImportWizard } from './pages/client/admin/ImportWizard';
import { AdminSchools } from './pages/client/admin/AdminSchools';
import { DataManager } from './pages/client/admin/DataManager';
import { AdminDashboard2 } from './pages/client/admin/AdminDashboard2';
import { CreateObjective } from './pages/client/admin/CreateObjective';
import { EditObjective } from './pages/client/admin/EditObjective';

// Auth Pages
import { Login } from './pages/Login';

// Guards
import { ClientAdminGuard } from './middleware/ClientAdminGuard';
import { SystemAdminGuard } from './middleware/SystemAdminGuard';
import { SchoolAdminGuard } from './middleware/SchoolAdminGuard';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Root Route - Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* System Admin Routes - /admin */}
        <Route path="/admin" element={<SystemAdminGuard><SystemAdminLayout /></SystemAdminGuard>}>
          <Route index element={<SystemDashboard />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* Client Public Routes - /:slug (New sidebar design) */}
        <Route path="/:slug" element={<PublicLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="overview" element={<Dashboard />} />
          <Route path="objective/:goalId" element={<ObjectiveDetail />} />
          <Route path="goal/:goalId" element={<GoalDetailNew />} />
        </Route>

        {/* Legacy Client Public Routes - /:slug/goals (Old design - kept for compatibility) */}
        <Route path="/:slug/goals" element={<ClientPublicLayout />}>
          <Route index element={<DistrictDashboard />} />
          <Route path=":goalId" element={<GoalDetail />} />
        </Route>
        <Route path="/:slug/metrics" element={<ClientPublicLayout />}>
          <Route index element={<MetricsDashboard />} />
        </Route>

        {/* Old Landing page route (redirect to new design) */}
        <Route path="/:slug/landing" element={<DistrictLandingPage />} />

        {/* School Routes - /:slug/schools */}
        {/* Schools directory (list of all schools) */}
        <Route path="/:slug/schools" element={<ClientPublicLayout />}>
          <Route index element={<SchoolsDirectory />} />
        </Route>

        {/* Individual school public routes */}
        <Route path="/:slug/schools/:schoolSlug" element={<ClientPublicLayout />}>
          <Route index element={<div>School Landing Page - Coming Soon</div>} />
          {/* TODO: Implement SchoolDashboard component (similar to DistrictDashboard but filtered by school_id) */}
          <Route path="goals" element={<div>School Dashboard - Coming Soon</div>} />
          <Route path="goals/:goalId" element={<GoalDetail />} />
        </Route>

        {/* School Admin Routes - /:slug/schools/:schoolSlug/admin */}
        <Route path="/:slug/schools/:schoolSlug/admin" element={<SchoolAdminGuard><ClientAdminLayout /></SchoolAdminGuard>}>
          <Route index element={<div>School Admin Dashboard - Coming Soon</div>} />
          <Route path="goals" element={<AdminGoals />} />
          <Route path="objectives/new" element={<ObjectiveBuilder />} />
          <Route path="objectives/:objectiveId/edit" element={<ObjectiveBuilder />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Client Admin Routes - /:slug/admin */}
        <Route path="/:slug/admin" element={<ClientAdminGuard><ClientAdminLayout /></ClientAdminGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="goals" element={<AdminGoals />} />
          <Route path="goals-v2" element={<AdminGoalsV2 />} />
          <Route path="objectives/new" element={<ObjectiveBuilder />} />
          <Route path="objectives/:objectiveId/edit" element={<ObjectiveBuilder />} />
          <Route path="goals/:goalId/edit" element={<ObjectiveBuilder />} />
          <Route path="import" element={<ImportWizard />} />
          <Route path="data-manager" element={<DataManager />} />
          <Route path="schools" element={<AdminSchools />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        {/* Client Admin v2 Routes - /:slug/admin2 (Editorial Design) */}
        <Route path="/:slug/admin2" element={<ClientAdminGuard><ClientAdminEditorialLayout /></ClientAdminGuard>}>
          <Route index element={<AdminDashboard2 />} />
          <Route path="objectives" element={<AdminDashboard2 />} />
          <Route path="objectives/create" element={<CreateObjective />} />
          <Route path="objectives/new" element={<ObjectiveBuilder />} />
          <Route path="objectives/:objectiveId/edit" element={<EditObjective />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
