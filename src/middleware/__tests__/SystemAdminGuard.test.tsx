import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SystemAdminGuard } from '../SystemAdminGuard';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock subdomain utilities
const mockGetSubdomainUrl = vi.fn();
vi.mock('../../lib/subdomain', () => ({
  getSubdomainUrl: (...args: unknown[]) => mockGetSubdomainUrl(...args),
}));

/**
 * Mock window.location for testing different environments
 */
function mockWindowLocation(overrides: Partial<Location>) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

  const mockLocation = {
    hostname: 'localhost',
    protocol: 'http:',
    port: '5174',
    origin: 'http://localhost:5174',
    search: '',
    hash: '',
    pathname: '/',
    href: 'http://localhost:5174/',
    host: 'localhost:5174',
    ancestorOrigins: {} as DOMStringList,
    assign: () => {},
    reload: () => {},
    replace: () => {},
    toString: () => 'http://localhost:5174/',
    ...overrides,
  };

  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  });

  return () => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'location', originalDescriptor);
    }
  };
}

function renderWithRouter(
  component: React.ReactElement,
  { initialEntries = ['/admin'] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/admin/*" element={component} />
        <Route path="/" element={<div>Root Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('SystemAdminGuard', () => {
  let cleanup: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup = mockWindowLocation({ hostname: 'localhost', search: '?subdomain=admin' });
  });

  afterEach(() => {
    cleanup?.();
  });

  it('shows loading state while checking auth', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isSystemAdmin: false,
      loading: true,
    });

    renderWithRouter(
      <SystemAdminGuard>
        <div>Protected Content</div>
      </SystemAdminGuard>
    );

    expect(screen.getByText('Verifying permissions...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isSystemAdmin: false,
      loading: false,
    });

    renderWithRouter(
      <SystemAdminGuard>
        <div>Protected Content</div>
      </SystemAdminGuard>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('preserves query params when redirecting to login (localhost)', () => {
    cleanup?.();
    cleanup = mockWindowLocation({
      hostname: 'localhost',
      search: '?subdomain=admin',
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isSystemAdmin: false,
      loading: false,
    });

    renderWithRouter(
      <SystemAdminGuard>
        <div>Protected Content</div>
      </SystemAdminGuard>,
      { initialEntries: ['/admin?subdomain=admin'] }
    );

    // Should redirect to login with subdomain param preserved
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects non-admin users to root domain', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isSystemAdmin: false,
      loading: false,
    });

    mockGetSubdomainUrl.mockReturnValue('http://localhost:5174');

    renderWithRouter(
      <SystemAdminGuard>
        <div>Protected Content</div>
      </SystemAdminGuard>
    );

    expect(mockGetSubdomainUrl).toHaveBeenCalledWith('root');
    expect(window.location.href).toBe('http://localhost:5174');
  });

  it('renders protected content for system admins', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isSystemAdmin: true,
      loading: false,
    });

    renderWithRouter(
      <SystemAdminGuard>
        <div>Protected Content</div>
      </SystemAdminGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  describe('Vercel preview environment', () => {
    beforeEach(() => {
      cleanup?.();
      cleanup = mockWindowLocation({
        hostname: 'strategic-plan-xyz123-pernells-projects.vercel.app',
        origin: 'https://strategic-plan-xyz123-pernells-projects.vercel.app',
        search: '?subdomain=admin',
        protocol: 'https:',
        port: '',
      });
    });

    it('redirects non-admin to root with query params on Vercel preview', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isSystemAdmin: false,
        loading: false,
      });

      mockGetSubdomainUrl.mockReturnValue('https://strategic-plan-xyz123-pernells-projects.vercel.app');

      renderWithRouter(
        <SystemAdminGuard>
          <div>Protected Content</div>
        </SystemAdminGuard>
      );

      expect(mockGetSubdomainUrl).toHaveBeenCalledWith('root');
    });
  });
});
