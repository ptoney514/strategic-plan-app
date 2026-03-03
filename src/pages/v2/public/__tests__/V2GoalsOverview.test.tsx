import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2GoalsOverview } from '../V2GoalsOverview';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' as const }),
}));

const mockUseDistrict = vi.fn();
vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: (...args: unknown[]) => mockUseDistrict(...args),
}));

const mockUsePlansBySlug = vi.fn();
vi.mock('../../../../hooks/v2/usePlans', () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock('../../../../hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockGoals = [
  {
    id: 'g-1',
    goal_number: '1',
    title: 'Academic Excellence',
    level: 0,
    status_detail: 'in_progress',
    children: [{ id: 'c-1' }, { id: 'c-2' }],
    parent_id: null,
    district_id: 'org-1',
    order_position: 0,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: 'g-2',
    goal_number: '2',
    title: 'Community Engagement',
    level: 0,
    status_detail: 'completed',
    children: [],
    parent_id: null,
    district_id: 'org-1',
    order_position: 1,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

describe('V2GoalsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDistrict.mockReturnValue({
      data: { id: 'org-1', name: 'Westside', primary_color: '#1e3a5f' },
      isLoading: false,
    });
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
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
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
    expect(mockNavigate).toHaveBeenCalledWith('/v2/goals/g-1');
  });

  it('renders breadcrumb with plan name', () => {
    render(<V2GoalsOverview />);
    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
    expect(screen.getByText('All Objectives')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2GoalsOverview />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no objectives', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalsOverview />);
    expect(screen.getByText('0 objectives total')).toBeInTheDocument();
  });

  it('shows no-plan message when no active+public plan', () => {
    mockUsePlansBySlug.mockReturnValue({
      data: [{ id: 'p-1', name: 'Draft Plan', is_active: false, is_public: false }],
      isLoading: false,
    });
    render(<V2GoalsOverview />);
    expect(screen.getByText('No public plan available')).toBeInTheDocument();
  });

  it('shows no-plan message when plans array is empty', () => {
    mockUsePlansBySlug.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalsOverview />);
    expect(screen.getByText('No public plan available')).toBeInTheDocument();
  });
});
