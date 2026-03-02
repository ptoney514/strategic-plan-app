import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { AddGoalInline } from '../AddGoalInline';

// Mock the goal hook
const mockCreateMutateAsync = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useCreateGoal: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

describe('AddGoalInline', () => {
  const mockOnCancel = vi.fn();
  const defaultProps = {
    planId: 'plan-1',
    districtId: 'district-1',
    parentId: null as string | null,
    level: 0 as const,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateMutateAsync.mockResolvedValue({});
  });

  it('renders input field with correct placeholder for level 0', () => {
    render(<AddGoalInline {...defaultProps} />);

    expect(screen.getByPlaceholderText(/new objective title/i)).toBeInTheDocument();
  });

  it('renders input field with correct placeholder for level 1', () => {
    render(<AddGoalInline {...defaultProps} level={1} />);

    expect(screen.getByPlaceholderText(/new goal title/i)).toBeInTheDocument();
  });

  it('renders input field with correct placeholder for level 2', () => {
    render(<AddGoalInline {...defaultProps} level={2} />);

    expect(screen.getByPlaceholderText(/new strategy title/i)).toBeInTheDocument();
  });

  it('auto-focuses the input', () => {
    render(<AddGoalInline {...defaultProps} />);

    const input = screen.getByPlaceholderText(/new objective title/i);
    expect(input).toHaveFocus();
  });

  it('submits goal on Enter key', async () => {
    const user = userEvent.setup();
    render(<AddGoalInline {...defaultProps} />);

    const input = screen.getByPlaceholderText(/new objective title/i);
    await user.type(input, 'New Objective{Enter}');

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      title: 'New Objective',
      plan_id: 'plan-1',
      district_id: 'district-1',
      parent_id: null,
      level: 0,
    });
  });

  it('calls onCancel on Escape key', async () => {
    const user = userEvent.setup();
    render(<AddGoalInline {...defaultProps} />);

    const input = screen.getByPlaceholderText(/new objective title/i);
    await user.type(input, '{Escape}');

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not submit empty title', async () => {
    const user = userEvent.setup();
    render(<AddGoalInline {...defaultProps} />);

    const input = screen.getByPlaceholderText(/new objective title/i);
    await user.type(input, '   {Enter}');

    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });
});
