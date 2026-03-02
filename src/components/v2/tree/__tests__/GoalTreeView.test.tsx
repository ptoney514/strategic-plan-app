import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { GoalTreeView } from '../GoalTreeView';
import type { HierarchicalGoal } from '@/lib/types';

// Mock the child GoalTreeItem and its hooks
vi.mock('@/hooks/v2/useGoals', () => ({
  useUpdateGoal: () => ({ mutate: vi.fn() }),
  useDeleteGoal: () => ({ mutate: vi.fn() }),
  useCreateGoal: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function makeGoal(overrides: Partial<HierarchicalGoal> = {}): HierarchicalGoal {
  return {
    id: 'goal-1',
    district_id: 'district-1',
    parent_id: null,
    goal_number: '1',
    title: 'Test Goal',
    level: 0 as const,
    order_position: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status_detail: 'not_started',
    children: [],
    ...overrides,
  };
}

describe('GoalTreeView', () => {
  const defaultProps = {
    planId: 'plan-1',
    districtId: 'district-1',
  };

  it('renders empty state when no goals', () => {
    render(<GoalTreeView goals={[]} {...defaultProps} />);

    expect(screen.getByText(/no objectives yet/i)).toBeInTheDocument();
  });

  it('renders goals in the list', () => {
    const goals = [
      makeGoal({ id: 'g1', title: 'Goal One', goal_number: '1' }),
      makeGoal({ id: 'g2', title: 'Goal Two', goal_number: '2' }),
    ];

    render(<GoalTreeView goals={goals} {...defaultProps} />);

    expect(screen.getByText('Goal One')).toBeInTheDocument();
    expect(screen.getByText('Goal Two')).toBeInTheDocument();
  });

  it('renders level badges for each goal', () => {
    const goals = [
      makeGoal({ id: 'g1', title: 'Goal One', goal_number: '1' }),
    ];

    render(<GoalTreeView goals={goals} {...defaultProps} />);

    expect(screen.getByText('L0')).toBeInTheDocument();
  });

  it('renders goal numbers', () => {
    const goals = [
      makeGoal({ id: 'g1', title: 'First', goal_number: '1' }),
      makeGoal({ id: 'g2', title: 'Second', goal_number: '2' }),
    ];

    render(<GoalTreeView goals={goals} {...defaultProps} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
