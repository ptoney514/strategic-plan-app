import { Routes, Route, Navigate } from 'react-router-dom';
import { MarketingLanding } from '../pages/marketing/Landing';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Welcome } from '../pages/Welcome';
import { AcceptInvitation } from '../pages/AcceptInvitation';
import { DistrictRedirect } from '../components/DistrictRedirect';
import { AccountSettings } from '../pages/AccountSettings';
import { AboutPage, PrivacyPage, TermsPage } from '../pages/legal';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { UserDashboard, PlaceholderPage, DashboardPlansPage } from '../pages/dashboard';
import { useAuth } from '../contexts/AuthContext';

// Public District Layout and Pages
import { PublicDistrictLayout } from '../layouts/PublicDistrictLayout';
import { Dashboard } from '../pages/client/public/Dashboard';
import { ObjectiveDetail } from '../pages/client/public/ObjectiveDetail';
import { GoalDetailNew } from '../pages/client/public/GoalDetailNew';

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
 * - Marketing landing page at / (always visible, logged in or not)
 * - User dashboard at /dashboard (requires authentication)
 * - Redirects legacy district paths to subdomains
 */
export function RootRouter() {
  return (
    <Routes>
      {/* Marketing landing page - always visible */}
      <Route path="/" element={<MarketingLanding />} />

      {/* Dashboard - requires authentication */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout basePath="/dashboard" />
          </RequireAuth>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="plans" element={<DashboardPlansPage />} />
        <Route path="plans/*" element={<DashboardPlansPage />} />
        <Route path="objectives" element={<PlaceholderPage title="Objectives & Goals" description="Track and manage your strategic objectives and goals." />} />
        <Route path="objectives/create" element={<PlaceholderPage title="Create Objective" description="Create a new objective for your strategic plan." />} />
        <Route path="objectives/:objectiveId" element={<PlaceholderPage title="Objective Details" description="View and edit objective details." />} />
        <Route path="metrics" element={<PlaceholderPage title="Metrics" description="Monitor key performance metrics across your plans." />} />
        <Route path="dashboards" element={<PlaceholderPage title="Dashboards" description="View customizable dashboards with your key data." />} />
        <Route path="reports" element={<PlaceholderPage title="Reports" description="Generate and export reports on your strategic progress." />} />
        <Route path="invite" element={<PlaceholderPage title="Invite Teammates" description="Invite team members to collaborate on your strategic plans." />} />
        <Route path="help" element={<PlaceholderPage title="Help & Support" description="Get help with using StrataDASH and contact support." />} />
      </Route>

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/welcome"
        element={
          <RequireAuth>
            <Welcome />
          </RequireAuth>
        }
      />
      <Route path="/invite/:token" element={<AcceptInvitation />} />

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

      {/* Public District Views - path-based access (no auth required) */}
      {/* URL pattern: stratadash.org/district/:slug */}
      <Route path="/district/:slug" element={<PublicDistrictLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Dashboard />} />
        <Route path="objective/:goalId" element={<ObjectiveDetail />} />
        <Route path="goal/:goalId" element={<GoalDetailNew />} />
      </Route>

      {/* Path-based district access: stratadash.org/:slug */}
      <Route path="/:slug" element={<PublicDistrictLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="overview" element={<Dashboard />} />
        <Route path="objective/:goalId" element={<ObjectiveDetail />} />
        <Route path="goal/:goalId" element={<GoalDetailNew />} />
      </Route>

      {/* Redirect other /:slug/* paths (goals, admin, schools) to subdomain */}
      <Route path="/:slug/*" element={<DistrictRedirect />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
