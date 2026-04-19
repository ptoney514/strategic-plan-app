import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/setup';
import { StatTile } from '../StatTile';

describe('StatTile', () => {
  it('renders the label and value', () => {
    render(<StatTile label="Current" value="72%" />);

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('applies stat-tile class on the root wrapper', () => {
    const { container } = render(<StatTile label="Current" value="72%" />);

    expect(container.querySelector('.stat-tile')).toBeInTheDocument();
  });

  it('renders the label with the .label class', () => {
    const { container } = render(<StatTile label="Current" value="72%" />);

    const label = container.querySelector('.stat-tile .label');
    expect(label).toHaveTextContent('Current');
  });

  it('renders the value with the .value class', () => {
    const { container } = render(<StatTile label="Current" value="72%" />);

    const value = container.querySelector('.stat-tile .value');
    expect(value).toHaveTextContent('72%');
  });

  it('renders default ink tone when tone prop is omitted', () => {
    const { container } = render(<StatTile label="Current" value="72%" />);

    const value = container.querySelector('.stat-tile .value') as HTMLElement;
    expect(value.style.color).toBe('');
  });

  it('renders muted tone when tone="muted"', () => {
    const { container } = render(
      <StatTile label="Target" value="85%" tone="muted" />
    );

    const value = container.querySelector('.stat-tile .value') as HTMLElement;
    expect(value.style.color).toBe('var(--ink-2)');
  });

  it('renders footer children when provided', () => {
    render(
      <StatTile
        label="Current"
        value="72%"
        footer={<span data-testid="trend">↑ 7 pts vs baseline</span>}
      />
    );

    expect(screen.getByTestId('trend')).toBeInTheDocument();
  });

  it('omits footer wrapper when footer prop is absent', () => {
    const { container } = render(<StatTile label="Current" value="72%" />);

    expect(container.querySelector('[data-testid="stat-tile-footer"]')).toBeNull();
  });
});
