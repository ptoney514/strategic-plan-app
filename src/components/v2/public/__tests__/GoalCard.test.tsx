import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { GoalCard } from '../GoalCard';
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
  description: 'Improve reading scores across all grades',
  status: 'in_progress' as const,
  widgets: mockWidgets,
  primaryColor: '#1e3a5f',
  isExpanded: false,
  onClick: vi.fn(),
};

describe('GoalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal number in badge', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('shows formatted value and unit from widget', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('CURRENT SCORE')).toBeInTheDocument();
  });

  it('shows target from widget config', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('Target: 85%')).toBeInTheDocument();
  });

  it('shows indicator badge when indicatorText is set', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.getByText('Off Track')).toBeInTheDocument();
  });

  it('does not show indicator badge when no indicatorText', () => {
    const noIndicatorWidgets: Widget[] = [{
      ...mockWidgets[0],
      config: { value: 92, target: 95, unit: '%', isHigherBetter: true },
    }];
    render(<GoalCard {...defaultProps} widgets={noIndicatorWidgets} />);
    expect(screen.queryByText('Off Track')).not.toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('shows "No metrics defined" when no widgets', () => {
    render(<GoalCard {...defaultProps} widgets={[]} />);
    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('shows "No metrics defined" when widgets undefined', () => {
    render(<GoalCard {...defaultProps} widgets={undefined} />);
    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoalCard {...defaultProps} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has aria-expanded="false" by default', () => {
    render(<GoalCard {...defaultProps} isExpanded={false} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-expanded="true" when expanded', () => {
    render(<GoalCard {...defaultProps} isExpanded={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('triggers onClick on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoalCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('triggers onClick on Space key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoalCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies primaryColor to badge border', () => {
    const { container } = render(
      <GoalCard {...defaultProps} primaryColor="#ff0000" />
    );
    const badge = container.querySelector('[style*="border: 2px solid"]');
    expect(badge).toBeTruthy();
    // jsdom converts hex to rgb
    expect(badge!.getAttribute('style')).toContain('rgb(255, 0, 0)');
  });

  it('has descriptive aria-label', () => {
    render(<GoalCard {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      'Goal 1.1: Reading Proficiency. Click to expand'
    );
  });

  it('shows COMPLETION label for donut widget type', () => {
    const donutWidgets: Widget[] = [{
      ...mockWidgets[0],
      type: 'donut',
      config: { value: 3.6, target: 4.2, unit: 'out of 5', label: 'Current Score' },
    }];
    render(<GoalCard {...defaultProps} widgets={donutWidgets} />);
    expect(screen.getByText('COMPLETION')).toBeInTheDocument();
    expect(screen.getByText('3.6 out of 5')).toBeInTheDocument();
  });

  it('does not show "No metrics defined" for widget without config.value (e.g. pie-breakdown)', () => {
    const pieWidgets: Widget[] = [{
      ...mockWidgets[0],
      type: 'pie-breakdown',
      title: 'Budget Allocation',
      config: {
        breakdownItems: [
          { label: 'Instruction', value: 58, color: '#3b82f6' },
          { label: 'Support', value: 22, color: '#10b981' },
        ],
      },
    }];
    render(<GoalCard {...defaultProps} widgets={pieWidgets} />);
    expect(screen.queryByText('No metrics defined')).not.toBeInTheDocument();
    expect(screen.getByText('METRIC')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows VALUE label for big-number widget type', () => {
    const bigNumberWidgets: Widget[] = [{
      ...mockWidgets[0],
      type: 'big-number',
      config: { value: 22, unit: 'students' },
    }];
    render(<GoalCard {...defaultProps} widgets={bigNumberWidgets} />);
    expect(screen.getByText('VALUE')).toBeInTheDocument();
    expect(screen.getByText('22 students')).toBeInTheDocument();
  });

  it('shows sub-goal count when provided', () => {
    render(<GoalCard {...defaultProps} subGoalCount={3} />);
    expect(screen.getByText('3 sub-goals')).toBeInTheDocument();
  });

  it('shows singular sub-goal for count of 1', () => {
    render(<GoalCard {...defaultProps} subGoalCount={1} />);
    expect(screen.getByText('1 sub-goal')).toBeInTheDocument();
  });

  it('does not show sub-goal count when zero', () => {
    render(<GoalCard {...defaultProps} subGoalCount={0} />);
    expect(screen.queryByText(/sub-goal/)).not.toBeInTheDocument();
  });

  it('does not show sub-goal count when undefined', () => {
    render(<GoalCard {...defaultProps} />);
    expect(screen.queryByText(/sub-goal/)).not.toBeInTheDocument();
  });
});
