import { Routes, Route, Navigate } from 'react-router-dom';
import { MarketingLanding } from '../pages/marketing/Landing';
import { Login } from '../pages/Login';
import { DistrictRedirect } from '../components/DistrictRedirect';
import { AccountSettings } from '../pages/AccountSettings';
import { AboutPage, PrivacyPage, TermsPage } from '../pages/legal';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { UserDashboard, PlaceholderPage } from '../pages/dashboard';
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
 * HomeRoute - Shows dashboard for authenticated users, marketing page for visitors
 */
function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardLayout />;
  }

  return <MarketingLanding />;
}

/**
 * Router for the root domain (stratadash.org)
 * Handles marketing pages, authenticated dashboard, and redirects legacy district paths to subdomains.
 */
export function RootRouter() {
  return (
    <Routes>
      {/* Home - Dashboard for authenticated users, Marketing for visitors */}
      <Route path="/" element={<HomeRoute />}>
        <Route index element={<UserDashboard />} />
        <Route path="plans" element={<PlaceholderPage title="Strategic Plans" description="View and manage all your strategic plans in one place." />} />
        <Route path="plans/new" element={<PlaceholderPage title="Create New Plan" description="Create a new strategic plan for your organization." />} />
        <Route path="plans/:planId/objectives/new" element={<PlaceholderPage title="Add New Objective" description="Add a new objective to your strategic plan." />} />
        <Route path="objectives" element={<PlaceholderPage title="Objectives & Goals" description="Track and manage your strategic objectives and goals." />} />
        <Route path="objectives/:objectiveId" element={<PlaceholderPage title="Objective Details" description="View and edit objective details." />} />
        <Route path="metrics" element={<PlaceholderPage title="Metrics" description="Monitor key performance metrics across your plans." />} />
        <Route path="dashboards" element={<PlaceholderPage title="Dashboards" description="View customizable dashboards with your key data." />} />
        <Route path="reports" element={<PlaceholderPage title="Reports" description="Generate and export reports on your strategic progress." />} />
        <Route path="invite" element={<PlaceholderPage title="Invite Teammates" description="Invite team members to collaborate on your strategic plans." />} />
        <Route path="help" element={<PlaceholderPage title="Help & Support" description="Get help with using StrataDASH and contact support." />} />
      </Route>

      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* Legal pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

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
