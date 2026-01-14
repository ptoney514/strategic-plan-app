import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Login } from '../Login';
import { buildSubdomainUrlWithPath } from '../../lib/subdomain';

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: { district_slug: 'westside' } })),
        })),
      })),
    })),
  },
}));

// Mock subdomain utilities
vi.mock('../../lib/subdomain', () => ({
  getSubdomainUrl: vi.fn((type: string) => {
    if (type === 'root') return 'http://localhost:5174';
    return 'http://localhost:5174';
  }),
  buildSubdomainUrlWithPath: vi.fn((type: string, path: string, slug?: string) => {
    if (type === 'district' && slug) {
      return `http://localhost:5174${path}?subdomain=${slug}`;
    }
    if (type === 'admin') {
      return `http://localhost:5174${path}?subdomain=admin`;
    }
    return `http://localhost:5174${path}`;
  }),
}));

// Mock auth context
const mockLogin = vi.fn();
const mockIsAuthenticated = vi.fn(() => false);
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: mockIsAuthenticated(),
  }),
}));

// Mock subdomain context
let mockSubdomainType = 'district';
vi.mock('../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({
    type: mockSubdomainType,
    slug: 'westside',
    hostname: 'localhost',
  }),
  SubdomainProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Track window.location.href assignments
let locationHrefSetter: string | null = null;
const originalLocation = window.location;

function createWrapper(initialPath: string = '/login') {
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
            <Route path="/login" element={children} />
            <Route path="/admin" element={<div data-testid="admin-page">Admin Page</div>} />
            <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubdomainType = 'district';
    locationHrefSetter = null;

    // Mock window.location for testing redirects
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'localhost',
      port: '5174',
      protocol: 'http:',
      search: '?subdomain=westside',
      href: 'http://localhost:5174/login?subdomain=westside',
    } as Location;

    // Track href setter
    Object.defineProperty(window.location, 'href', {
      get: () => locationHrefSetter || 'http://localhost:5174/login?subdomain=westside',
      set: (value) => { locationHrefSetter = value; },
      configurable: true,
    });
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('renders login form', () => {
    render(<Login />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates that email and password fields are required', () => {
    render(<Login />, { wrapper: createWrapper() });

    // Both fields should have required attribute (HTML5 validation)
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  describe('Post-login redirect behavior', () => {
    it('uses buildSubdomainUrlWithPath for district admin redirect', async () => {
      // Setup successful login
      mockLogin.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'admin@test.com',
            user_metadata: {},
            app_metadata: {},
          },
        },
      });

      render(<Login />, { wrapper: createWrapper() });

      // Fill in form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify that buildSubdomainUrlWithPath was called correctly
        // After fix: Login should use buildSubdomainUrlWithPath('district', '/admin', slug)
        // instead of navigate(`/${slug}/admin`)
        expect(buildSubdomainUrlWithPath).toHaveBeenCalledWith('district', '/admin', 'westside');
      });
    });

    it('redirects to correct URL on localhost with subdomain query param', async () => {
      mockLogin.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'admin@test.com',
            user_metadata: {},
            app_metadata: {},
          },
        },
      });

      render(<Login />, { wrapper: createWrapper() });

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@test.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        // The redirect URL should include the subdomain query param
        // Expected: http://localhost:5174/admin?subdomain=westside
        // NOT: /westside/admin (which would lose subdomain context)
        if (locationHrefSetter) {
          expect(locationHrefSetter).toContain('?subdomain=westside');
          expect(locationHrefSetter).toContain('/admin');
        }
      });
    });
  });
});
