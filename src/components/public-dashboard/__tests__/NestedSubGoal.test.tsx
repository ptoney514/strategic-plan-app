import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { NestedSubGoal } from '../NestedSubGoal';

const baseProps = {
  badgeText: '3.1.2.1',
  title: 'Faith-community partners',
  description: 'Weekend meal program, English-learner outreach',
  currentValue: '9',
  targetValue: '10',
  currentUnit: 'partners',
  status: 'on-track' as const,
};

describe('NestedSubGoal', () => {
  it('renders the nested-rail and subgoal-nested elements', () => {
    const { container } = render(<NestedSubGoal {...baseProps} />);

    expect(container.querySelector('.nested-rail')).toBeInTheDocument();
    expect(container.querySelector('.subgoal-nested')).toBeInTheDocument();
  });

  it('renders the badge text with the num-badge-xs class', () => {
    const { container } = render(<NestedSubGoal {...baseProps} />);

    const badge = container.querySelector('.num-badge-xs');
    expect(badge).toHaveTextContent('3.1.2.1');
  });

  it('renders the title and description', () => {
    render(<NestedSubGoal {...baseProps} />);

    expect(screen.getByText('Faith-community partners')).toBeInTheDocument();
    expect(
      screen.getByText('Weekend meal program, English-learner outreach')
    ).toBeInTheDocument();
  });

  it('renders current and target values and the unit', () => {
    render(<NestedSubGoal {...baseProps} />);

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();
    expect(screen.getByText('partners')).toBeInTheDocument();
  });

  it('renders a small StatusChip matching the status', () => {
    const { container } = render(<NestedSubGoal {...baseProps} />);

    const chip = container.querySelector('.chip.chip-on-track') as HTMLElement;
    expect(chip).toBeInTheDocument();
    expect(chip.style.fontSize).toBe('9px');
  });

  it('marks the nested-rail as aria-hidden', () => {
    const { container } = render(<NestedSubGoal {...baseProps} />);

    const rail = container.querySelector('.nested-rail');
    expect(rail).toHaveAttribute('aria-hidden', 'true');
  });

  it('fires onClick when the row is clicked', () => {
    const onClick = vi.fn();
    render(<NestedSubGoal {...baseProps} onClick={onClick} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Faith-community partners/ })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick on Enter key', () => {
    const onClick = vi.fn();
    render(<NestedSubGoal {...baseProps} onClick={onClick} />);

    fireEvent.keyDown(
      screen.getByRole('button', { name: /Faith-community partners/ }),
      { key: 'Enter' }
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick on Space key', () => {
    const onClick = vi.fn();
    render(<NestedSubGoal {...baseProps} onClick={onClick} />);

    fireEvent.keyDown(
      screen.getByRole('button', { name: /Faith-community partners/ }),
      { key: ' ' }
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders nothing onClick when no handler is passed', () => {
    expect(() =>
      render(<NestedSubGoal {...baseProps} />)
    ).not.toThrow();
  });
});
