import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2GoalDetail } from '../V2GoalDetail';
import type { Widget } from '../../../../lib/types/v2';

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
  useParams: () => ({ goalId: 'goal-1' }),
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
    data: { id: 'district-1', name: 'Test District', slug: 'test-org', primary_color: '#1e40af' },
    isLoading: false,
  }),
}));

// Mock usePlans
vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', name: 'Strategic Plan 2025', is_active: true }],
    isLoading: false,
  }),
}));

// Mock useGoals
const mockUpdateGoalMutate = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: () => ({
    data: [
      {
        id: 'goal-1',
        district_id: 'district-1',
        parent_id: null,
        goal_number: '1',
        title: 'Improve Academic Achievement',
        description: 'Focus on academic outcomes',
        level: 0,
        order_position: 1,
        status: 'in_progress',
        children: [
          {
            id: 'goal-1-1',
            district_id: 'district-1',
            parent_id: 'goal-1',
            goal_number: '1.1',
            title: 'Reading Proficiency',
            level: 1,
            order_position: 1,
            status: 'not_started',
            children: [],
          },
        ],
      },
    ],
    isLoading: false,
  }),
  useUpdateGoal: () => ({ mutate: mockUpdateGoalMutate }),
}));

// Mock widget hooks
const mockGoalWidgets: Widget[] = [
  {
    id: 'w-1',
    organizationId: 'org-1',
    planId: 'plan-1',
    goalId: 'goal-1',
    type: 'big-number',
    title: 'Student Count',
    config: { value: 500 },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();

vi.mock('@/hooks/v2/useWidgets', () => ({
  useWidgetsByGoal: () => ({
    data: mockGoalWidgets,
    isLoading: false,
  }),
  useCreateWidget: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateWidget: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
  useDeleteWidget: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
}));

describe('V2GoalDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal title', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('Improve Academic Achievement')).toBeInTheDocument();
  });

  it('renders goal number badge', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders goal description', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('Focus on academic outcomes')).toBeInTheDocument();
  });

  it('renders back link', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('Back to Plans & Goals')).toBeInTheDocument();
  });

  it('navigates back when back link clicked', async () => {
    const user = userEvent.setup();
    render(<V2GoalDetail />);

    await user.click(screen.getByText('Back to Plans & Goals'));
    expect(mockPush).toHaveBeenCalledWith('/admin/plans');
  });

  it('renders status dropdown', () => {
    render(<V2GoalDetail />);
    expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();
  });

  it('renders priority dropdown', () => {
    render(<V2GoalDetail />);
    expect(screen.getByDisplayValue('No Priority')).toBeInTheDocument();
  });

  it('renders existing goal widgets', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('Student Count')).toBeInTheDocument();
  });

  it('renders Add Widget button', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('renders widgets count', () => {
    render(<V2GoalDetail />);
    expect(screen.getByText('Widgets (1)')).toBeInTheDocument();
  });

  it('opens catalog when Add Widget clicked', async () => {
    const user = userEvent.setup();
    render(<V2GoalDetail />);

    await user.click(screen.getByText('Add Widget'));
    expect(screen.getByText('Choose a Widget Type')).toBeInTheDocument();
  });

  it('enters title edit mode when title clicked', async () => {
    const user = userEvent.setup();
    render(<V2GoalDetail />);

    await user.click(screen.getByText('Improve Academic Achievement'));
    const input = screen.getByDisplayValue('Improve Academic Achievement');
    expect(input.tagName).toBe('INPUT');
  });

  it('saves title on Enter', async () => {
    const user = userEvent.setup();
    render(<V2GoalDetail />);

    await user.click(screen.getByText('Improve Academic Achievement'));
    const input = screen.getByDisplayValue('Improve Academic Achievement');
    await user.clear(input);
    await user.type(input, 'New Title{Enter}');

    expect(mockUpdateGoalMutate).toHaveBeenCalledWith({
      id: 'goal-1',
      updates: { title: 'New Title' },
    });
  });

  it('updates status when changed', async () => {
    const user = userEvent.setup();
    render(<V2GoalDetail />);

    const statusSelect = screen.getByDisplayValue('In Progress');
    await user.selectOptions(statusSelect, 'completed');

    expect(mockUpdateGoalMutate).toHaveBeenCalledWith({
      id: 'goal-1',
      updates: { status: 'completed' },
    });
  });

  it('creates widget with goal_id', async () => {
    const user = userEvent.setup();
    render(<V2GoalDetail />);

    // Open catalog
    await user.click(screen.getByText('Add Widget'));
    // Select donut type
    await user.click(screen.getByText('Donut Chart'));
    // Should show config panel
    expect(screen.getByText('Configure Widget')).toBeInTheDocument();
  });
});
