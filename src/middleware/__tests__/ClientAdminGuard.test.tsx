import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ClientAdminGuard } from '../ClientAdminGuard';

// Mock the useAuth hook
const mockHasDistrictAccess = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    loading: mockLoading,
    hasDistrictAccess: mockHasDistrictAccess,
  }),
}));

let mockIsAuthenticated = false;
let mockLoading = false;

// Create test wrapper with necessary providers
function createWrapper(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
            <Route path="/" element={<div data-testid="public-page">Public Page</div>} />
            <Route
              path="/admin/*"
              element={
                <ClientAdminGuard districtSlug="westside">
                  {children}
                </ClientAdminGuard>
              }
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('ClientAdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    mockLoading = false;
    mockHasDistrictAccess.mockResolvedValue(false);
  });

  it('shows loading state while checking auth', async () => {
    mockLoading = true;

    render(
      <div data-testid="protected-content">Protected Content</div>,
      { wrapper: createWrapper('/admin') }
    );

    expect(screen.getByText('Verifying access...')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', async () => {
    mockIsAuthenticated = false;
    mockLoading = false;

    render(
      <div data-testid="protected-content">Protected Content</div>,
      { wrapper: createWrapper('/admin') }
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('redirects to / when user lacks district access', async () => {
    mockIsAuthenticated = true;
    mockLoading = false;
    mockHasDistrictAccess.mockResolvedValue(false);

    render(
      <div data-testid="protected-content">Protected Content</div>,
      { wrapper: createWrapper('/admin') }
    );

    await waitFor(() => {
      expect(screen.getByTestId('public-page')).toBeInTheDocument();
    });
  });

  it('renders children when user has district access', async () => {
    mockIsAuthenticated = true;
    mockLoading = false;
    mockHasDistrictAccess.mockResolvedValue(true);

    render(
      <div data-testid="protected-content">Protected Content</div>,
      { wrapper: createWrapper('/admin') }
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('calls hasDistrictAccess with the correct slug', async () => {
    mockIsAuthenticated = true;
    mockLoading = false;
    mockHasDistrictAccess.mockResolvedValue(true);

    render(
      <div data-testid="protected-content">Protected Content</div>,
      { wrapper: createWrapper('/admin') }
    );

    await waitFor(() => {
      expect(mockHasDistrictAccess).toHaveBeenCalledWith('westside');
    });
  });
});

describe('ClientAdminGuard redirect behavior - Subdomain Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = false;
    mockLoading = false;
  });

  it('stores /admin as "from" state when redirecting to login (not /${slug}/admin)', async () => {
    // This test verifies that the redirect state uses subdomain-aware paths
    // The "from" state should be "/admin" because the slug is in the subdomain
    mockIsAuthenticated = false;
    mockLoading = false;

    // Create a wrapper that captures the location state
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    let capturedState: any = null;

    function CaptureWrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route
                path="/login"
                element={
                  <CaptureLocation onCapture={(state) => { capturedState = state; }}>
                    <div data-testid="login-page">Login Page</div>
                  </CaptureLocation>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ClientAdminGuard districtSlug="westside">
                    {children}
                  </ClientAdminGuard>
                }
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );
    }

    render(
      <div data-testid="protected-content">Protected Content</div>,
      { wrapper: CaptureWrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    // After fix: from should be '/admin', not '/westside/admin'
    // This test will fail initially and pass after the fix
    expect(capturedState?.from).toBe('/admin');
  });
});

// Helper component to capture location state
function CaptureLocation({
  children,
  onCapture
}: {
  children: ReactNode;
  onCapture: (state: unknown) => void;
}) {
  const location = useLocation();
  onCapture(location.state);
  return <>{children}</>;
}
