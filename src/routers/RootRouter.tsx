import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { Welcome } from '../pages/Welcome';
import { AcceptInvitation } from '../pages/AcceptInvitation';
import { AccountSettings } from '../pages/AccountSettings';
import { AboutPage, PrivacyPage, TermsPage } from '../pages/legal';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { UserDashboard, PlaceholderPage, DashboardPlansPage, DashboardDistrictsPage } from '../pages/dashboard';
import { useAuth } from '../contexts/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

// V2 Lazy-loaded Pages
const V2MarketingLayout = lazy(() => import('../components/v2/layout/V2MarketingLayout').then(m => ({ default: m.V2MarketingLayout })));
const V2Landing = lazy(() => import('../pages/v2/marketing/V2Landing').then(m => ({ default: m.V2Landing })));
const V2Pricing = lazy(() => import('../pages/v2/marketing/V2Pricing').then(m => ({ default: m.V2Pricing })));
const V2OnboardingWizard = lazy(() => import('../pages/v2/onboarding/V2OnboardingWizard').then(m => ({ default: m.V2OnboardingWizard })));

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

const SuspensePage = (
  <div className="flex-1 flex items-center justify-center py-20">
    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" />
  </div>
);

const SuspenseFullPage = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full" />
  </div>
);

/**
 * Router for the root domain (stratadash.org)
 * - Marketing pages at / and /pricing
 * - Onboarding at /onboard (requires auth)
 * - User dashboard at /dashboard (requires auth)
 */
export function RootRouter() {
  return (
    <Routes>
      {/* Marketing pages with V2 layout */}
      <Route path="/" element={
        <ErrorBoundary>
          <Suspense fallback={SuspenseFullPage}>
            <V2MarketingLayout />
          </Suspense>
        </ErrorBoundary>
      }>
        <Route index element={<Suspense fallback={SuspensePage}><V2Landing /></Suspense>} />
        <Route path="pricing" element={<Suspense fallback={SuspensePage}><V2Pricing /></Suspense>} />
      </Route>

      {/* Onboarding wizard (requires auth, no marketing layout) */}
      <Route path="/onboard/*" element={
        <RequireAuth>
          <Suspense fallback={SuspenseFullPage}>
            <V2OnboardingWizard />
          </Suspense>
        </RequireAuth>
      } />

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
        <Route path="districts" element={<DashboardDistrictsPage />} />
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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

      {/* Legacy /v2 redirects */}
      <Route path="/v2" element={<Navigate to="/" replace />} />
      <Route path="/v2/pricing" element={<Navigate to="/pricing" replace />} />
      <Route path="/v2/onboard/*" element={<Navigate to="/onboard" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
