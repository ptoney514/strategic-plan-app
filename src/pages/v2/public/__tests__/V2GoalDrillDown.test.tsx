import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2GoalDrillDown } from '../V2GoalDrillDown';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ goalId: 'goal-1' }) };
});

vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' as const }),
}));

vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'org-1', name: 'Westside', primary_color: '#1e3a5f' },
    isLoading: false,
  }),
}));

vi.mock('../../../../hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', name: 'Strategic Plan 2025', is_active: true, is_public: true }],
    isLoading: false,
  }),
}));

const mockGoal = {
  id: 'goal-1',
  goal_number: '1',
  title: 'Academic Excellence',
  description: 'Improve student outcomes across all schools',
  status_detail: 'in_progress',
  level: 0,
  parent_id: null,
  district_id: 'org-1',
  order_position: 0,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

const mockChildren = [
  {
    id: 'c-1',
    goal_number: '1.1',
    title: 'Reading Proficiency',
    description: 'Increase reading scores by 15%',
    status_detail: 'in_progress',
    level: 1,
    parent_id: 'goal-1',
    district_id: 'org-1',
    order_position: 0,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: 'c-2',
    goal_number: '1.2',
    title: 'Math Achievement',
    status_detail: 'not_started',
    level: 1,
    parent_id: 'goal-1',
    district_id: 'org-1',
    order_position: 1,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return { ...actual, useQuery: (...args: unknown[]) => mockUseQuery(...args) };
});

describe('V2GoalDrillDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'goal') {
        return { data: mockGoal, isLoading: false };
      }
      if (queryKey[0] === 'goal-children') {
        return { data: mockChildren, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });
  });

  it('renders goal title', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
  });

  it('renders goal description', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Improve student outcomes across all schools')).toBeInTheDocument();
  });

  it('renders GoalStatusBadge', () => {
    render(<V2GoalDrillDown />);
    const badges = screen.getAllByText('In Progress');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders breadcrumb with plan name and goal title', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
    expect(screen.getByText('1 Academic Excellence')).toBeInTheDocument();
  });

  it('renders child goal count heading', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Goals (2)')).toBeInTheDocument();
  });

  it('renders GoalRow for each child', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
    expect(screen.getByText('Math Achievement')).toBeInTheDocument();
  });

  it('shows child description', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Increase reading scores by 15%')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2GoalDrillDown />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows "Goal not found" when goal is null', () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'goal') {
        return { data: null, isLoading: false };
      }
      return { data: [], isLoading: false };
    });
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Goal not found')).toBeInTheDocument();
  });

  it('shows empty children message when no children', () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'goal') {
        return { data: mockGoal, isLoading: false };
      }
      if (queryKey[0] === 'goal-children') {
        return { data: [], isLoading: false };
      }
      return { data: undefined, isLoading: false };
    });
    render(<V2GoalDrillDown />);
    expect(screen.getByText('No goals defined for this objective yet.')).toBeInTheDocument();
  });
});
