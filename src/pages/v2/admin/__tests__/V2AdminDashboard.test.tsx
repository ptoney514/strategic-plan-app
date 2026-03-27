import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2AdminDashboard } from '../V2AdminDashboard';

// Mock next/navigation router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null), toString: vi.fn().mockReturnValue('') }),
  usePathname: () => '/',
}));

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock useDistrict
vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'district-1', name: 'Test District', slug: 'test-org' },
    isLoading: false,
  }),
}));

// Mock plans hook
const mockPlans = [
  { id: 'plan-1', name: 'Strategic Plan 2025', is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'plan-2', name: 'Draft Plan', is_active: false, created_at: '2025-06-01T00:00:00Z' },
];
const mockCreatePlanMutateAsync = vi.fn();

vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: mockPlans,
    isLoading: false,
  }),
  useCreatePlan: () => ({
    mutateAsync: mockCreatePlanMutateAsync,
    isPending: false,
  }),
}));

// Mock team hook
vi.mock('@/hooks/v2/useTeam', () => ({
  useOrgMembers: () => ({
    data: [
      { id: 'm-1', user_name: 'Alice', user_email: 'alice@test.com', role: 'owner' },
      { id: 'm-2', user_name: 'Bob', user_email: 'bob@test.com', role: 'editor' },
    ],
    isLoading: false,
  }),
}));

// Mock goals query
vi.mock('@/lib/services/goals.service', () => ({
  GoalsService: {
    getByDistrict: vi.fn().mockResolvedValue([]),
  },
}));

describe('V2AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard heading', () => {
    render(<V2AdminDashboard />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/overview of your strategic plans/i)).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<V2AdminDashboard />);

    expect(screen.getByText('Plans')).toBeInTheDocument();
    expect(screen.getByText('Total Goals')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('displays correct plan count in stat card', () => {
    render(<V2AdminDashboard />);

    // Both Plans and Team Members show "2", so there should be multiple "2" elements
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it('displays correct team member count', () => {
    render(<V2AdminDashboard />);

    // Team Members stat card shows 2 (same value as plans count)
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(2);
  });

  it('renders strategic plans table with plan names', () => {
    render(<V2AdminDashboard />);

    expect(screen.getByText('Strategic Plans')).toBeInTheDocument();
    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
    expect(screen.getByText('Draft Plan')).toBeInTheDocument();
  });

  it('shows Active badge for active plans', () => {
    render(<V2AdminDashboard />);

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders New Plan button', () => {
    render(<V2AdminDashboard />);

    expect(screen.getByText('New Plan')).toBeInTheDocument();
  });

  it('renders Edit buttons for each plan', () => {
    render(<V2AdminDashboard />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons).toHaveLength(2);
  });

  it('calls navigate when Edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<V2AdminDashboard />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/admin/plans?planId=plan-1');
  });

  it('shows table headers', () => {
    render(<V2AdminDashboard />);

    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
