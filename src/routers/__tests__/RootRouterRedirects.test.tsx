import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock all heavy dependencies so we can test route matching in isolation

// Auth context — all routes need this
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, loading: false, user: null }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Subdomain context — DistrictRedirect and PublicDistrictLayout need this
vi.mock('../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ type: 'root', slug: null, hostname: 'stratadash.org' }),
  SubdomainProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock PublicDistrictLayout to render children with a testid
vi.mock('../../layouts/PublicDistrictLayout', () => ({
  PublicDistrictLayout: () => <div data-testid="public-district-layout">Public District Layout</div>,
}));

// Mock DistrictRedirect to render with a testid (don't trigger real window.location redirect)
vi.mock('../../components/DistrictRedirect', () => ({
  DistrictRedirect: () => <div data-testid="district-redirect">District Redirect</div>,
}));

// Mock page components to avoid pulling in their dependency trees
vi.mock('../../pages/marketing/Landing', () => ({
  MarketingLanding: () => <div data-testid="marketing-landing">Marketing</div>,
}));
vi.mock('../../pages/Login', () => ({
  Login: () => <div data-testid="login">Login</div>,
}));
vi.mock('../../pages/Signup', () => ({
  Signup: () => <div>Signup</div>,
}));
vi.mock('../../pages/Welcome', () => ({
  Welcome: () => <div>Welcome</div>,
}));
vi.mock('../../pages/AcceptInvitation', () => ({
  AcceptInvitation: () => <div>Accept</div>,
}));
vi.mock('../../pages/AccountSettings', () => ({
  AccountSettings: () => <div>Account</div>,
}));
vi.mock('../../pages/legal', () => ({
  AboutPage: () => <div>About</div>,
  PrivacyPage: () => <div>Privacy</div>,
  TermsPage: () => <div>Terms</div>,
}));
vi.mock('../../layouts/DashboardLayout', () => ({
  DashboardLayout: () => <div>Dashboard Layout</div>,
}));
vi.mock('../../pages/dashboard', () => ({
  UserDashboard: () => <div>User Dashboard</div>,
  PlaceholderPage: () => <div>Placeholder</div>,
  DashboardPlansPage: () => <div>Plans</div>,
  DashboardDistrictsPage: () => <div>Districts</div>,
}));
vi.mock('../../pages/client/public/Dashboard', () => ({
  Dashboard: () => <div>Dashboard</div>,
}));
vi.mock('../../pages/client/public/ObjectiveDetail', () => ({
  ObjectiveDetail: () => <div>Objective Detail</div>,
}));
vi.mock('../../pages/client/public/GoalDetailNew', () => ({
  GoalDetailNew: () => <div>Goal Detail</div>,
}));

import { RootRouter } from '../RootRouter';

function renderWithRouter(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <RootRouter />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RootRouter path-based routing', () => {
  describe('public district routes render PublicDistrictLayout', () => {
    it('/:slug renders district layout', () => {
      renderWithRouter('/westside');
      expect(screen.getByTestId('public-district-layout')).toBeInTheDocument();
    });

    it('/:slug/overview renders district layout', () => {
      renderWithRouter('/westside/overview');
      expect(screen.getByTestId('public-district-layout')).toBeInTheDocument();
    });

    it('/:slug/objective/:goalId renders district layout', () => {
      renderWithRouter('/westside/objective/abc-123');
      expect(screen.getByTestId('public-district-layout')).toBeInTheDocument();
    });

    it('/:slug/goal/:goalId renders district layout', () => {
      renderWithRouter('/westside/goal/abc-123');
      expect(screen.getByTestId('public-district-layout')).toBeInTheDocument();
    });
  });

  describe('legacy /:slug/* paths redirect via DistrictRedirect', () => {
    it('/:slug/goals redirects to subdomain', () => {
      renderWithRouter('/westside/goals');
      expect(screen.getByTestId('district-redirect')).toBeInTheDocument();
    });

    it('/:slug/admin redirects to subdomain', () => {
      renderWithRouter('/westside/admin');
      expect(screen.getByTestId('district-redirect')).toBeInTheDocument();
    });

    it('/:slug/schools redirects to subdomain', () => {
      renderWithRouter('/westside/schools');
      expect(screen.getByTestId('district-redirect')).toBeInTheDocument();
    });

    it('/:slug/schools/lincoln/goals redirects to subdomain', () => {
      renderWithRouter('/westside/schools/lincoln/goals');
      expect(screen.getByTestId('district-redirect')).toBeInTheDocument();
    });

    it('/:slug/metrics redirects to subdomain', () => {
      renderWithRouter('/westside/metrics');
      expect(screen.getByTestId('district-redirect')).toBeInTheDocument();
    });

    it('/:slug/landing redirects to subdomain', () => {
      renderWithRouter('/westside/landing');
      expect(screen.getByTestId('district-redirect')).toBeInTheDocument();
    });
  });

  describe('root-level routes are not affected', () => {
    it('/ renders marketing landing', () => {
      renderWithRouter('/');
      expect(screen.getByTestId('marketing-landing')).toBeInTheDocument();
    });

    it('/login renders login page', () => {
      renderWithRouter('/login');
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });
});
