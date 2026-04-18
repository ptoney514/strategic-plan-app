import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { GoalCardCollapsed } from '../GoalCardCollapsed';
import type { Widget } from '../../../../lib/types/v2';

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
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const defaultProps = {
  goalNumber: '1.1',
  title: 'Reading Proficiency',
  widgets: mockWidgets,
  primaryColor: '#1e3a5f',
  onClick: vi.fn(),
};

describe('GoalCardCollapsed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal number in badge', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('shows formatted KPI value from widget', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('shows target from widget config', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText('Target: 85%')).toBeInTheDocument();
  });

  it('shows indicator badge when indicatorText is set', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText('Off Track')).toBeInTheDocument();
  });

  it('shows "No metrics defined" when no widgets', () => {
    render(<GoalCardCollapsed {...defaultProps} widgets={[]} />);
    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoalCardCollapsed {...defaultProps} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows sub-goal count when provided', () => {
    render(<GoalCardCollapsed {...defaultProps} subGoalCount={3} />);
    expect(screen.getByText('3 sub-goals')).toBeInTheDocument();
  });

  it('shows singular sub-goal for count of 1', () => {
    render(<GoalCardCollapsed {...defaultProps} subGoalCount={1} />);
    expect(screen.getByText('1 sub-goal')).toBeInTheDocument();
  });

  it('has descriptive aria-label', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      'Goal 1.1: Reading Proficiency. Click to view details'
    );
  });

  it('uses 16px border radius (rounded-2xl)', () => {
    const { container } = render(<GoalCardCollapsed {...defaultProps} />);
    const card = container.querySelector('.rounded-2xl');
    expect(card).toBeInTheDocument();
  });

  it('shows type label for bar-chart widget', () => {
    render(<GoalCardCollapsed {...defaultProps} />);
    expect(screen.getByText('CURRENT SCORE')).toBeInTheDocument();
  });
});
