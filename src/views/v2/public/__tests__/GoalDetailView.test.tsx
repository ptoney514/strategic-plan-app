import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { GoalDetailView } from '../GoalDetailView';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: React.PropsWithChildren) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ReferenceLine: () => <div />,
  PieChart: ({ children }: React.PropsWithChildren) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: React.PropsWithChildren) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
}));

let mockGoalId = 'goal-parent';

vi.mock('next/navigation', () => ({
  useParams: () => ({ goalId: mockGoalId }),
  usePathname: () => `/district/westside/goals/${mockGoalId}`,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null), toString: vi.fn().mockReturnValue('') }),
}));

vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
  useDistrictLink: () => (path: string) => path,
}));

vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', is_active: true, is_public: true }],
    isLoading: false,
  }),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockUseWidgetsByGoals = vi.fn();
vi.mock('@/hooks/v2/useWidgets', () => ({
  useWidgetsByGoals: (...args: unknown[]) => mockUseWidgetsByGoals(...args),
}));

const goals = [
  {
    id: 'obj-1',
    district_id: 'district-1',
    parent_id: null,
    goal_number: '1',
    title: 'Student achievement',
    level: 0,
    order_position: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'in_progress',
    overall_progress: 70,
    children: [
      {
        id: 'goal-parent',
        district_id: 'district-1',
        parent_id: 'obj-1',
        goal_number: '1.1',
        title: 'Reading proficiency',
        description: 'Improve reading outcomes across grades.',
        level: 1,
        order_position: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        status: 'in_progress',
        overall_progress: 72,
        children: [
          {
            id: 'goal-child',
            district_id: 'district-1',
            parent_id: 'goal-parent',
            goal_number: '1.1.1',
            title: 'Phonics foundation',
            description: 'Build a consistent K-2 reading routine.',
            level: 2,
            order_position: 1,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
            status: 'on_target',
            overall_progress: 81,
            children: [],
          },
          {
            id: 'goal-leaf',
            district_id: 'district-1',
            parent_id: 'goal-parent',
            goal_number: '1.1.2',
            title: 'Middle school literacy',
            description: 'Strengthen independent reading habits.',
            level: 2,
            order_position: 2,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
            status: 'not_started',
            overall_progress: 45,
            children: [],
          },
        ],
      },
    ],
  },
];

const widgets = [
  {
    id: 'w-primary',
    organizationId: 'district-1',
    planId: 'plan-1',
    goalId: 'goal-parent',
    type: 'bar-chart' as const,
    title: 'Reading trend',
    config: {
      value: 72,
      baseline: 65,
      target: 85,
      unit: '%',
      dataPoints: [
        { label: '2022', value: 65 },
        { label: '2023', value: 69 },
        { label: '2024', value: 72 },
      ],
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w-secondary',
    organizationId: 'district-1',
    planId: 'plan-1',
    goalId: 'goal-parent',
    type: 'donut' as const,
    title: 'Reading cohort breakdown',
    config: {
      value: 72,
      target: 100,
      unit: '%',
    },
    position: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w-child',
    organizationId: 'district-1',
    planId: 'plan-1',
    goalId: 'goal-child',
    type: 'big-number' as const,
    title: 'Phonics mastery',
    config: {
      value: 81,
      unit: '%',
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('GoalDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoalId = 'goal-parent';
    mockUseGoalsByPlan.mockReturnValue({
      data: goals,
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({
      data: widgets,
      isLoading: false,
    });
  });

  it('renders navigable child goals and contextual visuals', () => {
    const { container } = render(<GoalDetailView />);

    expect(screen.getByText('Contextual visuals')).toBeInTheDocument();
    expect(screen.getByText('Goal visuals')).toBeInTheDocument();
    expect(screen.getByText('Child comparisons')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /phonics foundation/i })).toHaveAttribute(
      'href',
      '/goals/goal-child',
    );
    expect(screen.getByText('Reading cohort breakdown')).toBeInTheDocument();
    expect(screen.getByText('Phonics mastery')).toBeInTheDocument();

    const publicDetailGrids = container.querySelectorAll('[data-widget-grid-variant="public-detail"]');
    expect(publicDetailGrids).toHaveLength(2);
    publicDetailGrids.forEach((grid) => {
      expect(grid.className).toContain('grid-cols-1');
      expect(grid.className).toContain('xl:grid-cols-2');
      expect(grid.className).not.toContain('md:grid-cols-2');
    });
  });

  it('shows a public empty state when no extra visuals exist', () => {
    mockGoalId = 'goal-leaf';
    mockUseWidgetsByGoals.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<GoalDetailView />);

    expect(screen.getByText('No additional visuals published yet')).toBeInTheDocument();
    expect(screen.getByText('Back to parent goal')).toBeInTheDocument();
  });
});

describe('GoalDetailView – useDistrictLink routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoalId = 'goal-parent';
    mockUseGoalsByPlan.mockReturnValue({
      data: goals,
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({
      data: widgets,
      isLoading: false,
    });
  });

  it('produces no hard-coded /district/<slug> hrefs', () => {
    render(<GoalDetailView />);
    const hardCodedLinks = screen
      .queryAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.startsWith('/district/'));
    expect(hardCodedLinks).toHaveLength(0);
  });
});
