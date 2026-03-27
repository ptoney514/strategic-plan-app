import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { DashboardDistrictsPage } from '../DashboardDistrictsPage';

// Mock useUserDistrictsWithStats hook
const mockUseUserDistrictsWithStats = vi.fn();
vi.mock('../../../hooks/useUserDistricts', () => ({
  useUserDistrictsWithStats: () => mockUseUserDistrictsWithStats(),
}));

// Mock subdomain utility
vi.mock('../../../lib/subdomain', () => ({
  buildSubdomainUrlWithPath: (_type: string, path: string, slug: string) =>
    `http://${slug}.localhost:5174${path}`,
}));

const mockDistricts = [
  {
    id: 'org-1',
    name: 'Westside School District',
    slug: 'westside',
    entity_type: 'district',
    entity_label: 'District',
    logo_url: null,
    primary_color: '#1E40AF',
    secondary_color: '#DBEAFE',
    tagline: 'Excellence in education',
    is_public: true,
    is_active: true,
    admin_email: 'admin@westside.org',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    plan_count: 3,
    objective_count: 12,
    user_count: 5,
  },
  {
    id: 'org-2',
    name: 'Eastside Academy',
    slug: 'eastside',
    entity_type: 'district',
    entity_label: 'District',
    logo_url: 'https://example.com/logo.png',
    primary_color: '#DC2626',
    secondary_color: '#FEE2E2',
    tagline: 'Learning without limits',
    is_public: false,
    is_active: true,
    admin_email: 'admin@eastside.edu',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    plan_count: 1,
    objective_count: 4,
    user_count: 2,
  },
];

describe('DashboardDistrictsPage', () => {
  it('renders loading skeleton when loading', () => {
    mockUseUserDistrictsWithStats.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { container } = render(<DashboardDistrictsPage />);
    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it('renders empty state when no districts', () => {
    mockUseUserDistrictsWithStats.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<DashboardDistrictsPage />);
    expect(screen.getByText('No districts yet')).toBeInTheDocument();
    expect(
      screen.getByText("You don't have access to any districts yet."),
    ).toBeInTheDocument();
  });

  it('renders district cards with name, tagline, and stats', () => {
    mockUseUserDistrictsWithStats.mockReturnValue({
      data: mockDistricts,
      isLoading: false,
    });

    render(<DashboardDistrictsPage />);

    // District names
    expect(screen.getByText('Westside School District')).toBeInTheDocument();
    expect(screen.getByText('Eastside Academy')).toBeInTheDocument();

    // Taglines
    expect(screen.getByText('Excellence in education')).toBeInTheDocument();
    expect(screen.getByText('Learning without limits')).toBeInTheDocument();

    // Stats (check that numeric values appear)
    expect(screen.getByText('3')).toBeInTheDocument(); // Westside plan_count
    expect(screen.getByText('12')).toBeInTheDocument(); // Westside objective_count
    expect(screen.getByText('5')).toBeInTheDocument(); // Westside user_count
  });

  it('search filters districts by name', () => {
    mockUseUserDistrictsWithStats.mockReturnValue({
      data: mockDistricts,
      isLoading: false,
    });

    render(<DashboardDistrictsPage />);

    const searchInput = screen.getByPlaceholderText('Search districts...');
    fireEvent.change(searchInput, { target: { value: 'Eastside' } });

    expect(screen.getByText('Eastside Academy')).toBeInTheDocument();
    expect(screen.queryByText('Westside School District')).not.toBeInTheDocument();
  });

  it('"Open Admin" and "View Public" links use correct URLs', () => {
    mockUseUserDistrictsWithStats.mockReturnValue({
      data: [mockDistricts[0]],
      isLoading: false,
    });

    render(<DashboardDistrictsPage />);

    const adminLink = screen.getByText('Open Admin').closest('a');
    expect(adminLink).toHaveAttribute('href', 'http://westside.localhost:5174/admin');

    const publicLink = screen.getByText('View Public').closest('a');
    expect(publicLink).toHaveAttribute('href', 'http://westside.localhost:5174/');
  });

  it('shows result count when searching', () => {
    mockUseUserDistrictsWithStats.mockReturnValue({
      data: mockDistricts,
      isLoading: false,
    });

    render(<DashboardDistrictsPage />);

    const searchInput = screen.getByPlaceholderText('Search districts...');
    fireEvent.change(searchInput, { target: { value: 'Westside' } });

    expect(screen.getByText('Showing 1 of 2 districts')).toBeInTheDocument();
  });
});
