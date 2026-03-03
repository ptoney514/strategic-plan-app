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
  PieChart: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Area: () => <div />,
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ goalId: 'goal-1' }) };
});

// Mock subdomain context
vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
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

// Mock useQuery from @tanstack/react-query
const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return { ...actual, useQuery: (...args: unknown[]) => mockUseQuery(...args) };
});

const mockGoal = {
  id: 'goal-1',
  goal_number: '1',
  title: 'Academic Excellence',
  description: 'Improve student outcomes',
  status_detail: 'in_progress',
  level: 0,
  overall_progress: 72,
};

const mockChildren = [
  {
    id: 'c-1',
    goal_number: '1.1',
    title: 'Reading Proficiency',
    description: 'Increase reading scores',
    status_detail: 'in_progress',
    overall_progress: 65,
  },
  {
    id: 'c-2',
    goal_number: '1.2',
    title: 'Math Achievement',
    status_detail: 'not_started',
    overall_progress: 30,
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

    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'goal') {
        return { data: mockGoal, isLoading: false };
      }
      if (queryKey[0] === 'goal-children') {
        return { data: mockChildren, isLoading: false };
      }
      return { data: undefined, isLoading: false };
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
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2GoalDrillDown />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows "Goal not found" when goal is null', () => {
    mockUseQuery.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === 'goal') {
        return { data: null, isLoading: false };
      }
      if (queryKey[0] === 'goal-children') {
        return { data: [], isLoading: false };
      }
      return { data: undefined, isLoading: false };
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

  it('passes useWidgetsByGoals the child goal IDs', () => {
    render(<V2GoalDrillDown />);
    expect(mockUseWidgetsByGoals).toHaveBeenCalledWith(['c-1', 'c-2']);
  });
});
