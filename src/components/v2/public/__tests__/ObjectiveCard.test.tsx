import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { ObjectiveCard } from '../ObjectiveCard';

const defaultProps = {
  goalNumber: '1',
  title: 'Academic Excellence',
  childCount: 3,
  status: 'in_progress',
  primaryColor: '#1e3a5f',
  onClick: vi.fn(),
};

describe('ObjectiveCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal number in badge', () => {
    render(<ObjectiveCard {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<ObjectiveCard {...defaultProps} />);
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
  });

  it('renders singular "goal" when childCount is 1', () => {
    render(<ObjectiveCard {...defaultProps} childCount={1} />);
    expect(screen.getByText(/1 goal/)).toBeInTheDocument();
  });

  it('renders plural "goals" when childCount > 1', () => {
    render(<ObjectiveCard {...defaultProps} childCount={3} />);
    expect(screen.getByText(/3 goals/)).toBeInTheDocument();
  });

  it('renders GoalStatusBadge with status', () => {
    render(<ObjectiveCard {...defaultProps} status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ObjectiveCard {...defaultProps} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ObjectiveCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies primaryColor to badge', () => {
    render(<ObjectiveCard {...defaultProps} primaryColor="#ff0000" />);
    const badge = screen.getByText('1');
    expect(badge).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('has role="button" and tabIndex={0}', () => {
    render(<ObjectiveCard {...defaultProps} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
  });
});
