import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { GoalTreeItem } from '../GoalTreeItem';
import type { HierarchicalGoal } from '@/lib/types';

// Mock the goal hooks
const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockCreateMutateAsync = vi.fn();

vi.mock('@/hooks/v2/useGoals', () => ({
  useUpdateGoal: () => ({ mutate: mockUpdateMutate }),
  useDeleteGoal: () => ({ mutate: mockDeleteMutate }),
  useCreateGoal: () => ({ mutateAsync: mockCreateMutateAsync, isPending: false }),
}));

function makeGoal(overrides: Partial<HierarchicalGoal> = {}): HierarchicalGoal {
  return {
    id: 'goal-1',
    district_id: 'district-1',
    parent_id: null,
    goal_number: '1',
    title: 'Improve Academic Achievement',
    level: 0 as const,
    order_position: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status_detail: 'in_progress',
    children: [],
    ...overrides,
  };
}

describe('GoalTreeItem', () => {
  const defaultProps = {
    planId: 'plan-1',
    districtId: 'district-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal title', () => {
    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    expect(screen.getByText('Improve Academic Achievement')).toBeInTheDocument();
  });

  it('renders goal number', () => {
    render(<GoalTreeItem goal={makeGoal({ goal_number: '1.2' })} {...defaultProps} />);

    expect(screen.getByText('1.2')).toBeInTheDocument();
  });

  it('renders level badge for L0', () => {
    render(<GoalTreeItem goal={makeGoal({ level: 0 })} {...defaultProps} />);

    expect(screen.getByText('L0')).toBeInTheDocument();
  });

  it('renders level badge for L1', () => {
    render(<GoalTreeItem goal={makeGoal({ level: 1, goal_number: '1.1' })} {...defaultProps} />);

    expect(screen.getByText('L1')).toBeInTheDocument();
  });

  it('renders level badge for L2', () => {
    render(<GoalTreeItem goal={makeGoal({ level: 2, goal_number: '1.1.1' })} {...defaultProps} />);

    expect(screen.getByText('L2')).toBeInTheDocument();
  });

  it('renders status dropdown with options', () => {
    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    const statusSelect = screen.getByDisplayValue('In Progress');
    expect(statusSelect).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('On Hold')).toBeInTheDocument();
  });

  it('enters edit mode when title is clicked', async () => {
    const user = userEvent.setup();
    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    await user.click(screen.getByText('Improve Academic Achievement'));

    // Should show an input with the title
    const input = screen.getByDisplayValue('Improve Academic Achievement');
    expect(input.tagName).toBe('INPUT');
  });

  it('saves title on Enter key', async () => {
    const user = userEvent.setup();
    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    // Click title to enter edit mode
    await user.click(screen.getByText('Improve Academic Achievement'));

    const input = screen.getByDisplayValue('Improve Academic Achievement');
    await user.clear(input);
    await user.type(input, 'Updated Title{Enter}');

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: 'goal-1',
      updates: { title: 'Updated Title' },
    });
  });

  it('cancels edit on Escape key', async () => {
    const user = userEvent.setup();
    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    // Click title to enter edit mode
    await user.click(screen.getByText('Improve Academic Achievement'));

    const input = screen.getByDisplayValue('Improve Academic Achievement');
    await user.clear(input);
    await user.type(input, 'Changed Title{Escape}');

    // Should not call update
    expect(mockUpdateMutate).not.toHaveBeenCalled();
    // Should revert
    expect(screen.getByText('Improve Academic Achievement')).toBeInTheDocument();
  });

  it('calls delete with confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    const deleteBtn = screen.getByTitle('Delete goal');
    await user.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalledWith('Delete this goal and all sub-goals?');
    expect(mockDeleteMutate).toHaveBeenCalledWith('goal-1');

    confirmSpy.mockRestore();
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<GoalTreeItem goal={makeGoal()} {...defaultProps} />);

    const deleteBtn = screen.getByTitle('Delete goal');
    await user.click(deleteBtn);

    expect(mockDeleteMutate).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('renders children recursively', () => {
    const goalWithChildren = makeGoal({
      children: [
        makeGoal({
          id: 'child-1',
          title: 'Child Goal',
          level: 1,
          goal_number: '1.1',
          parent_id: 'goal-1',
        }),
      ],
    });

    render(<GoalTreeItem goal={goalWithChildren} {...defaultProps} />);

    expect(screen.getByText('Improve Academic Achievement')).toBeInTheDocument();
    expect(screen.getByText('Child Goal')).toBeInTheDocument();
  });
});
