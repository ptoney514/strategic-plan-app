import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2GoalsOverview } from '../V2GoalsOverview';

// Mock next/navigation
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
vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
  useDistrictLink: () => (path: string) => path,
}));

// Mock useDistrict
vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'org-1', name: 'Westside', primary_color: '#1e3a5f' },
    isLoading: false,
  }),
}));

// Mock usePlansBySlug
const mockUsePlansBySlug = vi.fn();
vi.mock('../../../../hooks/v2/usePlans', () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

// Mock useGoalsByPlan
const mockUseGoalsByPlan = vi.fn();
vi.mock('../../../../hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockGoals = [
  {
    id: 'g-1',
    goal_number: '1',
    title: 'Academic Excellence',
    description: 'Improve academic outcomes',
    overall_progress: 72,
    level: 0,
    status_detail: 'in_progress',
    children: [{ id: 'g-1a' }, { id: 'g-1b' }],
  },
  {
    id: 'g-2',
    goal_number: '2',
    title: 'Community Engagement',
    level: 0,
    status_detail: 'completed',
    children: [],
  },
];

describe('V2GoalsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePlansBySlug.mockReturnValue({
      data: [{ id: 'plan-1', name: 'Strategic Plan 2025', is_active: true, is_public: true }],
      isLoading: false,
    });

    mockUseGoalsByPlan.mockReturnValue({
      data: mockGoals,
      isLoading: false,
    });
  });

  it('renders "Strategic Objectives" heading', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText('Strategic Objectives')).toBeInTheDocument();
  });

  it('renders objective count text', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText('2 objectives total')).toBeInTheDocument();
  });

  it('renders ObjectiveCards for each objective', () => {
    render(<V2GoalsOverview />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(2);
  });

  it('shows "Academic Excellence" card', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
  });

  it('shows "Community Engagement" card', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText('Community Engagement')).toBeInTheDocument();
  });

  it('displays correct child count', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText(/2 goals/)).toBeInTheDocument();
    expect(screen.getByText(/0 goals/)).toBeInTheDocument();
  });

  it('navigates on card click', async () => {
    const user = userEvent.setup();
    render(<V2GoalsOverview />);

    const cards = screen.getAllByRole('button');
    await user.click(cards[0]);
    expect(mockPush).toHaveBeenCalledWith('/goals/g-1');
  });

  it('shows loading spinner when loading', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2GoalsOverview />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows empty state when no objectives', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalsOverview />);

    expect(screen.getByText('No objectives have been defined yet.')).toBeInTheDocument();
  });

  it('shows no-plan message when no active+public plan', () => {
    mockUsePlansBySlug.mockReturnValue({
      data: [{ id: 'plan-1', name: 'Draft Plan', is_active: false, is_public: false }],
      isLoading: false,
    });
    render(<V2GoalsOverview />);

    expect(screen.getByText('No public plan available')).toBeInTheDocument();
  });

  it('renders description in ObjectiveCard', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText('Improve academic outcomes')).toBeInTheDocument();
  });

  it('renders "View details" text for each card', () => {
    render(<V2GoalsOverview />);
    const viewDetailsLinks = screen.getAllByText('View details');
    expect(viewDetailsLinks).toHaveLength(2);
  });
});
