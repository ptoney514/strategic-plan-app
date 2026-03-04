import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { ExpandedGoalCard } from '../ExpandedGoalCard';
import type { Goal } from '../../../../lib/types';
import type { Widget } from '../../../../lib/types/v2';

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

// Mock Recharts components (they don't render in jsdom)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: React.PropsWithChildren) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  PieChart: ({ children }: React.PropsWithChildren) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div />,
  AreaChart: ({ children }: React.PropsWithChildren) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
}));

const mockGoal: Goal = {
  id: 'goal-1',
  district_id: 'org-1',
  parent_id: null,
  goal_number: '1.1',
  title: 'Reading Proficiency',
  description: 'Improve reading scores across all grades',
  level: 1,
  order_position: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  overall_progress: 65,
  owner_name: 'Dr. Smith',
  priority: 'high',
  status: 'in_progress',
  children: [
    {
      id: 'child-1',
      district_id: 'org-1',
      parent_id: 'goal-1',
      goal_number: '1.1.1',
      title: 'K-2 Reading Program',
      description: 'Early literacy initiative',
      level: 2,
      order_position: 0,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      status: 'in_progress',
    },
    {
      id: 'child-2',
      district_id: 'org-1',
      parent_id: 'goal-1',
      goal_number: '1.1.2',
      title: 'Grade 3-5 Comprehension',
      level: 2,
      order_position: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      status: 'not_started',
    },
  ],
};

const mockWidgets: Widget[] = [
  {
    id: 'w-1',
    organizationId: 'org-1',
    planId: 'plan-1',
    goalId: 'goal-1',
    type: 'bar-chart',
    title: 'ELA Proficiency Rate',
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
        { label: '2022', value: 68 },
        { label: '2023', value: 70 },
        { label: '2024', value: 72 },
      ],
      colors: ['#1e40af'],
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('ExpandedGoalCard', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal title', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('renders goal description', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('Improve reading scores across all grades')).toBeInTheDocument();
  });

  it('renders close button with correct aria-label', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    const closeBtn = screen.getByLabelText('Collapse goal details');
    expect(closeBtn).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);

    await user.click(screen.getByLabelText('Collapse goal details'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows widget value and type label when widgets provided', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('CURRENT SCORE')).toBeInTheDocument();
  });

  it('shows target from widget config', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('Target: 85%')).toBeInTheDocument();
  });

  it('shows baseline from widget config', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('Baseline: 65%')).toBeInTheDocument();
  });

  it('shows indicator badge when indicatorText set', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('Off Track')).toBeInTheDocument();
  });

  it('renders widget chart', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows owner name when present', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('shows priority badge when present', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows sub-goals when no widgets', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={[]} onClose={onClose} />);
    expect(screen.getByText('Sub-Goals (2)')).toBeInTheDocument();
    expect(screen.getByText('K-2 Reading Program')).toBeInTheDocument();
    expect(screen.getByText('1.1.1')).toBeInTheDocument();
    expect(screen.getByText('Grade 3-5 Comprehension')).toBeInTheDocument();
    expect(screen.getByText('1.1.2')).toBeInTheDocument();
  });

  it('shows sub-goals alongside widgets', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    // Widget chart should be present
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    // Sub-goals should also be present
    expect(screen.getByText('Sub-Goals (2)')).toBeInTheDocument();
    expect(screen.getByText('K-2 Reading Program')).toBeInTheDocument();
    expect(screen.getByText('Grade 3-5 Comprehension')).toBeInTheDocument();
  });

  it('shows sub-goal description when present', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={[]} onClose={onClose} />);
    expect(screen.getByText('Early literacy initiative')).toBeInTheDocument();
  });

  it('shows goal number in header badge', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('shows "No metrics defined" when no children and no widgets', () => {
    const emptyGoal: Goal = {
      ...mockGoal,
      overall_progress: 0,
      children: [],
      owner_name: undefined,
      priority: undefined,
    };
    render(<ExpandedGoalCard goal={emptyGoal} widgets={[]} onClose={onClose} />);
    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('does not show indicator when no indicatorText', () => {
    const noIndicatorWidgets: Widget[] = [{
      ...mockWidgets[0],
      config: { value: 92, target: 95, unit: '%', isHigherBetter: true },
    }];
    render(<ExpandedGoalCard goal={mockGoal} widgets={noIndicatorWidgets} onClose={onClose} />);
    expect(screen.queryByText('Off Track')).not.toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('does not show owner when owner_name is undefined', () => {
    const goalWithoutOwner: Goal = {
      ...mockGoal,
      owner_name: undefined,
    };
    render(<ExpandedGoalCard goal={goalWithoutOwner} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.queryByText('Dr. Smith')).not.toBeInTheDocument();
  });

  it('does not show priority badge when priority is undefined', () => {
    const goalWithoutPriority: Goal = {
      ...mockGoal,
      priority: undefined,
    };
    render(<ExpandedGoalCard goal={goalWithoutPriority} widgets={mockWidgets} onClose={onClose} />);
    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });

  it('renders widget chart for pie-breakdown without config.value', () => {
    const pieWidgets: Widget[] = [{
      id: 'w-pie-noval',
      organizationId: 'org-1',
      planId: 'plan-1',
      goalId: 'goal-1',
      type: 'pie-breakdown',
      title: 'Budget Allocation',
      config: {
        breakdownItems: [
          { label: 'Instruction', value: 58, color: '#3b82f6' },
          { label: 'Support', value: 22, color: '#10b981' },
        ],
      },
      position: 0,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }];
    render(<ExpandedGoalCard goal={mockGoal} widgets={pieWidgets} onClose={onClose} />);
    expect(screen.queryByText('No metrics defined')).not.toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders pie-breakdown widget chart', () => {
    const pieWidgets: Widget[] = [{
      id: 'w-pie',
      organizationId: 'org-1',
      planId: 'plan-1',
      goalId: 'goal-1',
      type: 'pie-breakdown',
      title: 'Budget Allocation',
      config: {
        value: 100,
        breakdownItems: [
          { label: 'Instruction', value: 58, color: '#3b82f6' },
          { label: 'Support', value: 22, color: '#10b981' },
          { label: 'Admin', value: 12, color: '#f59e0b' },
          { label: 'Ops', value: 8, color: '#6b7280' },
        ],
      },
      position: 0,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    }];
    render(<ExpandedGoalCard goal={mockGoal} widgets={pieWidgets} onClose={onClose} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders sub-goal rows as links with correct href', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={[]} onClose={onClose} />);
    const link1 = screen.getByRole('link', { name: /K-2 Reading Program/i });
    const link2 = screen.getByRole('link', { name: /Grade 3-5 Comprehension/i });
    expect(link1).toHaveAttribute('href', '/goals/child-1');
    expect(link2).toHaveAttribute('href', '/goals/child-2');
  });

  it('shows inline widget preview when subGoalWidgets provided', () => {
    const subGoalWidgets: Record<string, Widget[]> = {
      'child-1': [{
        id: 'w-sub-1',
        organizationId: 'org-1',
        planId: 'plan-1',
        goalId: 'child-1',
        type: 'big-number',
        title: 'Literacy Rate',
        config: { value: 88, unit: '%' },
        position: 0,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }],
    };
    render(
      <ExpandedGoalCard goal={mockGoal} widgets={[]} subGoalWidgets={subGoalWidgets} onClose={onClose} />
    );
    expect(screen.getByText('88% · VALUE')).toBeInTheDocument();
  });

  it('renders sub-goal as link even without widget preview', () => {
    render(<ExpandedGoalCard goal={mockGoal} widgets={[]} subGoalWidgets={{}} onClose={onClose} />);
    const link = screen.getByRole('link', { name: /K-2 Reading Program/i });
    expect(link).toHaveAttribute('href', '/goals/child-1');
    // No widget preview text for child-2
    expect(screen.queryByText(/· VALUE/)).not.toBeInTheDocument();
  });
});
