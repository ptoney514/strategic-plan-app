import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { GoalStatusBadge } from '../GoalStatusBadge';

describe('GoalStatusBadge', () => {
  it('renders "Completed" label for status "completed"', () => {
    render(<GoalStatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders "On Target" label for status "on-target"', () => {
    render(<GoalStatusBadge status="on-target" />);
    expect(screen.getByText('On Target')).toBeInTheDocument();
  });

  it('renders "In Progress" label for status "in_progress"', () => {
    render(<GoalStatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders "At Risk" label for status "at-risk"', () => {
    render(<GoalStatusBadge status="at-risk" />);
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('renders "Critical" label for status "critical"', () => {
    render(<GoalStatusBadge status="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders "Off Target" label for status "off-target"', () => {
    render(<GoalStatusBadge status="off-target" />);
    expect(screen.getByText('Off Target')).toBeInTheDocument();
  });

  it('renders "Not Started" label for status "not_started"', () => {
    render(<GoalStatusBadge status="not_started" />);
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('renders "On Hold" label for status "on_hold"', () => {
    render(<GoalStatusBadge status="on_hold" />);
    expect(screen.getByText('On Hold')).toBeInTheDocument();
  });

  it('renders "Not Started" label for undefined status', () => {
    render(<GoalStatusBadge status={undefined} />);
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<GoalStatusBadge status="completed" className="custom-class" />);
    const badge = screen.getByText('Completed');
    expect(badge).toHaveClass('custom-class');
  });
});
