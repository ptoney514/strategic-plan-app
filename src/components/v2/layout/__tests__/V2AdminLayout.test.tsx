import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2AdminLayout } from '../V2AdminLayout';

// Ensure window.location has origin for auth-client URL construction
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: {
      hostname: 'localhost',
      port: '5173',
      protocol: 'http:',
      search: '',
      pathname: '/',
      href: 'http://localhost:5173/',
      origin: 'http://localhost:5173',
    },
    writable: true,
  });
});

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock useDistrict
vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: {
      id: 'district-1',
      name: 'Test District',
      slug: 'test-org',
      logo_url: null,
      primary_color: '#3b82f6',
    },
    isLoading: false,
  }),
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'admin@test.com', name: 'Admin User' },
    isAuthenticated: true,
    isSystemAdmin: false,
    loading: false,
  }),
}));

// Mock auth-client to avoid window.location issues
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

describe('V2AdminLayout', () => {
  it('renders the sidebar with district name', () => {
    render(<V2AdminLayout />);

    expect(screen.getAllByText('Test District').length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation links', () => {
    render(<V2AdminLayout />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Plans & Goals')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('renders the main content area with Outlet', () => {
    render(<V2AdminLayout><div data-testid="outlet">Outlet Content</div></V2AdminLayout>);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders user name from email', () => {
    render(<V2AdminLayout />);

    // Email "admin@test.com" -> "admin"
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', () => {
    render(<V2AdminLayout />);

    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });

  it('shows district initials when no logo', () => {
    const { container } = render(<V2AdminLayout />);

    // "Test District" -> "TE"
    const initialsElements = container.querySelectorAll('.rounded-lg');
    const found = Array.from(initialsElements).some((el) => el.textContent === 'TE');
    expect(found).toBe(true);
  });
});
