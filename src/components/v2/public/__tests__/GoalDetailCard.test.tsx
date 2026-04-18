import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { GoalDetailCard } from '../GoalDetailCard';
import type { Goal } from '../../../../lib/types';
import type { Widget } from '../../../../lib/types/v2';

// Mock Recharts components
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

describe('GoalDetailCard', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal title', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('renders goal description', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('Improve reading scores across all grades')).toBeInTheDocument();
  });

  it('renders goal number badge', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows KPI value at 44px weight (large number)', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('shows target', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('shows baseline', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it('shows owner name', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('renders widget chart', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders sub-goals section', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    expect(screen.getByText('Sub-goals (2)')).toBeInTheDocument();
    expect(screen.getByText('K-2 Reading Program')).toBeInTheDocument();
    expect(screen.getByText('Grade 3-5 Comprehension')).toBeInTheDocument();
  });

  it('renders sub-goal rows as links', () => {
    render(<GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />);
    const link1 = screen.getByRole('link', { name: /K-2 Reading Program/i });
    expect(link1).toHaveAttribute('href', '/goals/child-1');
  });

  it('uses custom buildLink for sub-goal hrefs', () => {
    render(
      <GoalDetailCard
        goal={mockGoal}
        widgets={mockWidgets}
        onBack={onBack}
        buildLink={(p) => `/westside${p}`}
      />
    );
    const link1 = screen.getByRole('link', { name: /K-2 Reading Program/i });
    expect(link1).toHaveAttribute('href', '/westside/goals/child-1');
  });

  it('shows "No metrics defined" when no children and no widgets', () => {
    const emptyGoal: Goal = { ...mockGoal, children: [], owner_name: undefined, priority: undefined };
    render(<GoalDetailCard goal={emptyGoal} widgets={[]} onBack={onBack} />);
    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('uses 16px border radius (rounded-2xl)', () => {
    const { container } = render(
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} onBack={onBack} />
    );
    const card = container.querySelector('.rounded-2xl');
    expect(card).toBeInTheDocument();
  });

  it('renders sub-goal widget preview value when subGoalWidgets provided', () => {
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
      <GoalDetailCard goal={mockGoal} widgets={mockWidgets} subGoalWidgets={subGoalWidgets} onBack={onBack} />
    );
    expect(screen.getByText('88%')).toBeInTheDocument();
  });
});
