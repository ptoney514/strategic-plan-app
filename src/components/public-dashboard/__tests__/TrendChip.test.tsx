import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/setup';
import { TrendChip } from '../TrendChip';

describe('TrendChip', () => {
  it('renders with up direction: ↑ glyph and trend-up class', () => {
    const { container } = render(
      <TrendChip direction="up" label="7 pts vs baseline" />
    );

    const chip = container.querySelector('.trend-chip');
    expect(chip).toHaveClass('trend-up');
    expect(chip?.textContent).toContain('↑');
  });

  it('renders with down direction: ↓ glyph and trend-down class', () => {
    const { container } = render(
      <TrendChip direction="down" label="0.3 pts YoY" />
    );

    const chip = container.querySelector('.trend-chip');
    expect(chip).toHaveClass('trend-down');
    expect(chip?.textContent).toContain('↓');
  });

  it('renders with flat direction: → glyph and trend-flat class', () => {
    const { container } = render(
      <TrendChip direction="flat" label="flat vs last year" />
    );

    const chip = container.querySelector('.trend-chip');
    expect(chip).toHaveClass('trend-flat');
    expect(chip?.textContent).toContain('→');
  });

  it('renders the label text', () => {
    render(<TrendChip direction="up" label="7 pts vs baseline" />);

    expect(screen.getByText('7 pts vs baseline')).toBeInTheDocument();
  });

  it('marks the arrow glyph as aria-hidden', () => {
    const { container } = render(
      <TrendChip direction="up" label="7 pts vs baseline" />
    );

    const arrow = container.querySelector('[aria-hidden="true"]');
    expect(arrow?.textContent).toBe('↑');
  });
});
