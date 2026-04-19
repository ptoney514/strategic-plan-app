import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/setup';
import { StatusChip, type StatusValue } from '../StatusChip';

const cases: Array<{ status: StatusValue; expectedClass: string; defaultLabel: string }> = [
  { status: 'on-track', expectedClass: 'chip-on-track', defaultLabel: 'On target' },
  { status: 'in-progress', expectedClass: 'chip-in-progress', defaultLabel: 'In progress' },
  { status: 'off-track', expectedClass: 'chip-off-track', defaultLabel: 'Off track' },
  { status: 'not-started', expectedClass: 'chip-not-started', defaultLabel: 'Not started' },
  { status: 'completed', expectedClass: 'chip-completed', defaultLabel: 'Complete' },
];

describe('StatusChip', () => {
  cases.forEach(({ status, expectedClass, defaultLabel }) => {
    it(`renders ${status} with ${expectedClass} class and default label "${defaultLabel}"`, () => {
      const { container } = render(<StatusChip status={status} />);

      const chip = container.querySelector('.chip');
      expect(chip).toHaveClass(expectedClass);
      expect(chip).toHaveTextContent(defaultLabel);
    });
  });

  it('respects a custom label when provided', () => {
    render(<StatusChip status="in-progress" label="Cooking" />);

    expect(screen.getByText('Cooking')).toBeInTheDocument();
    expect(screen.queryByText('In progress')).toBeNull();
  });

  it('renders a status-dot inside the chip', () => {
    const { container } = render(<StatusChip status="on-track" />);

    const dot = container.querySelector('.chip .status-dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies small-size inline style when size="sm"', () => {
    const { container } = render(<StatusChip status="on-track" size="sm" />);

    const chip = container.querySelector('.chip') as HTMLElement;
    expect(chip.style.fontSize).toBe('9px');
    expect(chip.style.padding).toBe('3px 7px');
  });

  it('does not apply small-size styles at default size', () => {
    const { container } = render(<StatusChip status="on-track" />);

    const chip = container.querySelector('.chip') as HTMLElement;
    expect(chip.style.fontSize).toBe('');
    expect(chip.style.padding).toBe('');
  });
});
