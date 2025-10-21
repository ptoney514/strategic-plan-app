import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { SystemAdminLayout } from './layouts/SystemAdminLayout';
import { ClientPublicLayout } from './layouts/ClientPublicLayout';
import { ClientAdminLayout } from './layouts/ClientAdminLayout';

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

// Client Admin Pages
import { AdminDashboard } from './pages/client/admin/AdminDashboard';
import { AdminGoals } from './pages/client/admin/AdminGoals';
import AdminGoalsV2 from './pages/client/admin/AdminGoalsV2';
import { AdminAudit } from './pages/client/admin/AdminAudit';
import { AdminSettings } from './pages/client/admin/AdminSettings';
import { ObjectiveBuilder } from './pages/client/admin/ObjectiveBuilder';
import { ImportWizard } from './pages/client/admin/ImportWizard';

// Auth Pages
import { Login } from './pages/Login';

// Guards
import { ClientAdminGuard } from './middleware/ClientAdminGuard';
import { SystemAdminGuard } from './middleware/SystemAdminGuard';
import { SchoolAdminGuard } from './middleware/SchoolAdminGuard';

function App() {
  return (
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

        {/* Client Public Routes - /:slug */}
        {/* Landing page without layout (has its own header/footer) */}
        <Route path="/:slug" element={<DistrictLandingPage />} />

        {/* Dashboard pages with layout */}
        <Route path="/:slug" element={<ClientPublicLayout />}>
          <Route path="goals" element={<DistrictDashboard />} />
          <Route path="goals/:goalId" element={<GoalDetail />} />
          <Route path="metrics" element={<MetricsDashboard />} />
        </Route>

        {/* School Routes - /:slug/schools */}
        {/* Schools directory (list of all schools) */}
        <Route path="/:slug/schools" element={<ClientPublicLayout />}>
          <Route index element={<SchoolsDirectory />} />
        </Route>

        {/* Individual school public routes */}
        <Route path="/:slug/schools/:schoolSlug" element={<ClientPublicLayout />}>
          <Route index element={<div>School Landing Page - Coming Soon</div>} />
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
          <Route path="schools" element={<div>Manage Schools - Coming Soon</div>} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
