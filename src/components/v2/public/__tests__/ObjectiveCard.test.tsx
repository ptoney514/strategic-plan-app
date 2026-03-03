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

  it('renders goal number as prefix with dot', () => {
    render(<ObjectiveCard {...defaultProps} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<ObjectiveCard {...defaultProps} />);
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
  });

  it('renders singular "goal" when childCount is 1', () => {
    render(<ObjectiveCard {...defaultProps} childCount={1} />);
    expect(screen.getByText('1 goal')).toBeInTheDocument();
  });

  it('renders plural "goals" when childCount > 1', () => {
    render(<ObjectiveCard {...defaultProps} childCount={3} />);
    expect(screen.getByText('3 goals')).toBeInTheDocument();
  });

  it('renders GoalStatusBadge with status', () => {
    render(<ObjectiveCard {...defaultProps} status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders fallback description when none provided', () => {
    render(<ObjectiveCard {...defaultProps} />);
    expect(
      screen.getByText('Strategic objective for organizational growth and excellence.')
    ).toBeInTheDocument();
  });

  it('renders provided description', () => {
    render(
      <ObjectiveCard {...defaultProps} description="Improve student outcomes" />
    );
    expect(screen.getByText('Improve student outcomes')).toBeInTheDocument();
  });

  it('renders "View details" footer', () => {
    render(<ObjectiveCard {...defaultProps} />);
    expect(screen.getByText('View details')).toBeInTheDocument();
  });

  it('renders progress bar when overallProgress is provided and > 0', () => {
    const { container } = render(
      <ObjectiveCard {...defaultProps} overallProgress={65} />
    );
    const progressFill = container.querySelector(
      '[style*="width: 65%"]'
    );
    expect(progressFill).toBeInTheDocument();
  });

  it('hides progress bar when progressDisplayMode is hidden', () => {
    const { container } = render(
      <ObjectiveCard
        {...defaultProps}
        overallProgress={65}
        progressDisplayMode="hidden"
      />
    );
    const progressFill = container.querySelector(
      '[style*="width: 65%"]'
    );
    expect(progressFill).not.toBeInTheDocument();
  });

  it('hides progress bar when overallProgress is 0', () => {
    const { container } = render(
      <ObjectiveCard {...defaultProps} overallProgress={0} />
    );
    const progressFill = container.querySelector(
      '[style*="width:"]'
    );
    expect(progressFill).not.toBeInTheDocument();
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

  it('has role="button" and tabIndex={0}', () => {
    render(<ObjectiveCard {...defaultProps} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
  });
});
