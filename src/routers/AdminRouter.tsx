import { Routes, Route, Navigate } from 'react-router-dom';
import { SystemAdminGuard } from '../middleware/SystemAdminGuard';
import { SystemAdminEditorialLayout } from '../layouts/SystemAdminEditorialLayout';
import { SystemDashboard } from '../pages/admin/SystemDashboard';
import { SystemSettings } from '../pages/admin/SystemSettings';
import { UserManagement } from '../pages/admin/UserManagement';
import { ContactSubmissions } from '../pages/admin/ContactSubmissions';
import { DistrictsPage } from '../pages/admin/DistrictsPage';
import { DistrictSetupWizard } from '../pages/admin/DistrictSetupWizard';
import { Login } from '../pages/Login';

/**
 * Router for the admin subdomain (admin.stratadash.org)
 * Handles system admin routes - requires system_admin role.
 */
export function AdminRouter() {
  return (
    <Routes>
      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* System Admin Routes */}
      <Route
        path="/"
        element={
          <SystemAdminGuard>
            <SystemAdminEditorialLayout />
          </SystemAdminGuard>
        }
      >
        <Route index element={<SystemDashboard />} />
        <Route path="districts" element={<DistrictsPage />} />
        <Route path="districts/new" element={<DistrictSetupWizard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="contacts" element={<ContactSubmissions />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Catch-all redirects to admin dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
