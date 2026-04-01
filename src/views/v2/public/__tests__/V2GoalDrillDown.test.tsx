import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2GoalDrillDown } from '../V2GoalDrillDown';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, id, ...props }: React.PropsWithChildren<{ className?: string; id?: string }>) => (
      <div className={className} id={id} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  LayoutGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock Recharts (used by ExpandedGoalCard renderers)
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
  PieChart: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Area: () => <div />,
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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
vi.mock('../../../../hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', name: 'Strategic Plan 2025', is_active: true, is_public: true }],
    isLoading: false,
  }),
}));

// Mock useWidgetsByGoals
const mockUseWidgetsByGoals = vi.fn();
vi.mock('../../../../hooks/v2/useWidgets', () => ({
  useWidgetsByGoals: (...args: unknown[]) => mockUseWidgetsByGoals(...args),
}));

// Mock useGoalsByPlan
const mockUseGoalsByPlan = vi.fn();
vi.mock('../../../../hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockHierarchicalGoals = [
  {
    id: 'goal-1',
    goal_number: '1',
    title: 'Academic Excellence',
    description: 'Improve student outcomes',
    status_detail: 'in_progress',
    level: 0,
    overall_progress: 72,
    children: [
      {
        id: 'c-1',
        goal_number: '1.1',
        title: 'Reading Proficiency',
        description: 'Increase reading scores',
        status_detail: 'in_progress',
        overall_progress: 65,
        children: [
          {
            id: 'gc-1',
            goal_number: '1.1.1',
            title: 'Phonics Program',
            status_detail: 'in_progress',
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: 'c-2',
        goal_number: '1.2',
        title: 'Math Achievement',
        status_detail: 'not_started',
        overall_progress: 30,
        children: [],
      },
    ],
  },
];

const mockWidgetData = [
  {
    id: 'w-1',
    organizationId: 'org-1',
    planId: 'plan-1',
    goalId: 'c-1',
    type: 'bar-chart',
    title: 'ELA Proficiency',
    config: {
      value: 72,
      baseline: 65,
      target: 85,
      unit: '%',
      isHigherBetter: true,
      indicatorText: 'Off Track',
      indicatorColor: 'red',
      dataPoints: [
        { label: '2021', value: 65 },
        { label: '2024', value: 72 },
      ],
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('V2GoalDrillDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGoalsByPlan.mockReturnValue({
      data: mockHierarchicalGoals,
      isLoading: false,
    });

    mockUseWidgetsByGoals.mockReturnValue({
      data: mockWidgetData,
      isLoading: false,
    });
  });

  it('renders goal title', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
  });

  it('renders goal description', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Improve student outcomes')).toBeInTheDocument();
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

  it('renders GoalCard for each child with goal numbers visible', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('1.1')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();
  });

  it('renders children as buttons with aria-expanded', () => {
    render(<V2GoalDrillDown />);
    const buttons = screen.getAllByRole('button');
    // Each child GoalCard is a button
    const goalButtons = buttons.filter((b) => b.hasAttribute('aria-expanded'));
    expect(goalButtons).toHaveLength(2);
    goalButtons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('shows child title "Reading Proficiency"', () => {
    render(<V2GoalDrillDown />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('shows widget data on child card with widgets', () => {
    render(<V2GoalDrillDown />);
    // c-1 has a widget with indicator badge "Off Track" and type label
    expect(screen.getByText('Off Track')).toBeInTheDocument();
    expect(screen.getByText('CURRENT SCORE')).toBeInTheDocument();
  });

  it('shows "No metrics defined" for child without widgets', () => {
    render(<V2GoalDrillDown />);
    // c-2 has no widgets
    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2GoalDrillDown />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows "Goal not found" when goal is not in hierarchy', () => {
    mockUseGoalsByPlan.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalDrillDown />);

    expect(screen.getByText('Goal not found')).toBeInTheDocument();
  });

  it('shows empty children message when no children', () => {
    mockUseGoalsByPlan.mockReturnValue({
      data: [
        {
          id: 'goal-1',
          goal_number: '1',
          title: 'Academic Excellence',
          description: 'Improve student outcomes',
          status_detail: 'in_progress',
          level: 0,
          overall_progress: 72,
          children: [],
        },
      ],
      isLoading: false,
    });
    render(<V2GoalDrillDown />);

    expect(screen.getByText('No goals defined for this objective yet.')).toBeInTheDocument();
  });

  it('expands a child card when clicked, showing ExpandedGoalCard with close button', async () => {
    const user = userEvent.setup();
    render(<V2GoalDrillDown />);

    // Click the first GoalCard (Reading Proficiency)
    const goalButtons = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'));
    await user.click(goalButtons[0]);

    // ExpandedGoalCard should now show a close button
    expect(screen.getByLabelText('Collapse goal details')).toBeInTheDocument();
  });

  it('collapses expanded card when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<V2GoalDrillDown />);

    // Expand first child
    const goalButtons = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'));
    await user.click(goalButtons[0]);

    // Click close button
    const closeBtn = screen.getByLabelText('Collapse goal details');
    await user.click(closeBtn);

    // Close button should no longer be present
    expect(screen.queryByLabelText('Collapse goal details')).not.toBeInTheDocument();
  });

  it('shows ProgressRing in header when goal has overall_progress', () => {
    render(<V2GoalDrillDown />);
    const progressRing = screen.getByRole('img', { name: '72% progress' });
    expect(progressRing).toBeInTheDocument();
  });

  it('grid has md:grid-cols-3 class', () => {
    const { container } = render(<V2GoalDrillDown />);
    const grid = container.querySelector('.md\\:grid-cols-3');
    expect(grid).toBeInTheDocument();
  });

  it('passes useWidgetsByGoals parent ID plus all descendant IDs', () => {
    render(<V2GoalDrillDown />);
    expect(mockUseWidgetsByGoals).toHaveBeenCalledWith('westside', ['goal-1', 'c-1', 'gc-1', 'c-2']);
  });

  it('shows parent widgets in Metrics section when goal has no children', () => {
    mockUseGoalsByPlan.mockReturnValue({
      data: [
        {
          id: 'goal-1',
          goal_number: '1',
          title: 'Academic Excellence',
          description: 'Improve student outcomes',
          status_detail: 'in_progress',
          level: 0,
          overall_progress: 72,
          children: [],
        },
      ],
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({
      data: [
        {
          id: 'w-parent',
          organizationId: 'org-1',
          planId: 'plan-1',
          goalId: 'goal-1',
          type: 'big-number',
          title: 'Graduation Rate',
          config: { value: 95, unit: '%' },
          position: 0,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
    });
    render(<V2GoalDrillDown />);

    expect(screen.getByText('Metrics (1)')).toBeInTheDocument();
    expect(screen.queryByText('No goals defined for this objective yet.')).not.toBeInTheDocument();
  });

  it('shows empty state when goal has no children and no widgets', () => {
    mockUseGoalsByPlan.mockReturnValue({
      data: [
        {
          id: 'goal-1',
          goal_number: '1',
          title: 'Academic Excellence',
          description: 'Improve student outcomes',
          status_detail: 'in_progress',
          level: 0,
          overall_progress: 72,
          children: [],
        },
      ],
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({ data: [], isLoading: false });
    render(<V2GoalDrillDown />);

    expect(screen.getByText('No goals defined for this objective yet.')).toBeInTheDocument();
    expect(screen.queryByText(/^Metrics/)).not.toBeInTheDocument();
  });
});
