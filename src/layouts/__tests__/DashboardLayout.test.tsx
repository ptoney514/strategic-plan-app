import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/setup';
import { DashboardLayout } from '../DashboardLayout';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => vi.fn(),
    Outlet: () => <div data-testid="outlet">Page Content</div>,
  };
});

// Mock useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        display_name: 'Test User',
        role: 'district_admin',
      },
    },
    logout: vi.fn(),
    isSystemAdmin: false,
  }),
}));

// Mock ThemeContext
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: vi.fn(),
    isDark: false,
    toggle: vi.fn(),
  }),
}));

// Mock SubdomainContext
vi.mock('../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ type: 'root', slug: null }),
}));

// Mock subdomain utility
vi.mock('../../lib/subdomain', () => ({
  buildSubdomainUrlWithPath: () => 'http://localhost:5173',
  getSubdomainUrl: () => 'http://localhost:5173',
}));

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

describe('DashboardLayout', () => {
  it('renders the layout structure', () => {
    render(<DashboardLayout basePath="/" />);

    // Should render sidebar
    expect(screen.getByRole('complementary')).toBeInTheDocument();

    // Should render header
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Should render content outlet
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders main element with relative positioning', () => {
    render(<DashboardLayout basePath="/" />);

    // Find main element by looking for the outlet container's parent
    const outlet = screen.getByTestId('outlet');
    const contentWrapper = outlet.parentElement;
    const main = contentWrapper?.parentElement;

    // Verify main has relative class for proper absolute positioning of gradient
    expect(main).toHaveClass('relative');
    expect(main).toHaveClass('flex-1');
    expect(main).toHaveClass('overflow-y-auto');
  });

  it('has proper content margin to account for fixed sidebar', () => {
    render(<DashboardLayout basePath="/" />);

    // Find the main content wrapper (sibling of sidebar)
    const sidebar = screen.getByRole('complementary');
    const contentDiv = sidebar.parentElement?.querySelector('.ml-\\[270px\\]');

    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveClass('ml-[270px]');
  });
});

describe('DashboardLayout gradient positioning', () => {
  it('has relative positioning on main for absolute gradient child', () => {
    render(<DashboardLayout basePath="/" />);

    // The main element needs relative positioning so the absolute gradient
    // is properly contained within it
    const outlet = screen.getByTestId('outlet');
    const contentWrapper = outlet.parentElement;
    const main = contentWrapper?.parentElement;

    // Main should have relative class
    expect(main?.className).toContain('relative');
  });
});
