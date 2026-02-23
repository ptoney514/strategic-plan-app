import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/setup';
import { DashboardSidebar } from '../DashboardSidebar';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock useUserDistricts hook
vi.mock('../../../hooks/useUserDistricts', () => ({
  useUserDistricts: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

// Mock useDistrict hook
vi.mock('../../../hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

// Mock SubdomainContext
vi.mock('../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({
    type: 'root',
    slug: null,
  }),
}));

describe('DashboardSidebar', () => {
  it('renders the sidebar with correct z-index class', () => {
    render(<DashboardSidebar basePath="/" />);

    // Find the aside element (sidebar)
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();

    // Verify z-40 is applied for proper stacking above overlays
    expect(sidebar).toHaveClass('z-40');
  });

  it('renders with fixed positioning', () => {
    render(<DashboardSidebar basePath="/" />);

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('fixed');
    expect(sidebar).toHaveClass('top-0');
    expect(sidebar).toHaveClass('left-0');
    expect(sidebar).toHaveClass('bottom-0');
  });

  it('renders navigation items', () => {
    render(<DashboardSidebar basePath="/" />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Districts')).toBeInTheDocument();
    expect(screen.getByText('Strategic plans')).toBeInTheDocument();
    expect(screen.getByText('Objectives & goals')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders footer navigation items', () => {
    render(<DashboardSidebar basePath="/" />);

    expect(screen.getByText('Invite teammates')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
  });

  it('renders logo and brand name', () => {
    render(<DashboardSidebar basePath="/" />);

    expect(screen.getByText('StrataDASH')).toBeInTheDocument();
    expect(screen.getByAltText('StrataDASH')).toBeInTheDocument();
  });

  it('uses correct basePath for navigation links', () => {
    render(<DashboardSidebar basePath="/admin" />);

    // Check that links are correctly prefixed
    const homeLink = screen.getByRole('link', { name: /StrataDASH/i });
    expect(homeLink).toHaveAttribute('href', '/admin');

    const objectivesLink = screen.getByRole('link', { name: /Objectives & goals/i });
    expect(objectivesLink).toHaveAttribute('href', '/admin/objectives');
  });

  it('highlights active navigation item', () => {
    render(<DashboardSidebar basePath="/" />);

    // Home should be active (pathname is '/')
    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveClass('bg-brand-teal/20');
  });
});

describe('DashboardSidebar z-index hierarchy', () => {
  it('has z-index 40 to be above potential overlays', () => {
    render(<DashboardSidebar basePath="/" />);

    const sidebar = screen.getByRole('complementary');
    const className = sidebar.className;

    // Verify z-40 is present (not z-20 or z-30)
    expect(className).toContain('z-40');
    expect(className).not.toContain('z-20');
    expect(className).not.toContain('z-30');
  });
});
