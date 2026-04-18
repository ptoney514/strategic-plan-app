import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { DonutWidget } from '../DonutWidget';

/**
 * DonutWidget renders the raw `value` in the center (with a `%` suffix only
 * when `unit === '%'`). Progress is represented visually by the ring segment;
 * the center text is NOT a computed ratio. The caption line below shows
 * `value / target` with the unit formatted per MD3 conventions.
 */
describe('DonutWidget', () => {
  it('renders the raw value in the center with % suffix when unit is %', () => {
    render(<DonutWidget config={{ value: 75, target: 100, unit: '%' }} title="Test" />);
    // Center: "75" and a separate "%" span, both rendered in the big tabular number
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders value and target in the caption row', () => {
    render(<DonutWidget config={{ value: 50, target: 200 }} title="Test" />);
    // "50" appears twice: once in the big center number, once in the "50 / 200" caption.
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1);
    // Caption row contains target
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<DonutWidget config={{ value: 10, target: 50, label: 'completed' }} title="Test" />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('renders default label when none provided', () => {
    render(<DonutWidget config={{ value: 0, target: 100 }} title="Test" />);
    expect(screen.getByText('of goal')).toBeInTheDocument();
  });

  it('shows unit in the caption row when provided', () => {
    render(<DonutWidget config={{ value: 50, target: 100, unit: 'pts' }} title="Test" />);
    // Non-% units render inline with the value in the caption: "50 pts"
    expect(screen.getByText(/50 pts/)).toBeInTheDocument();
    expect(screen.getByText(/100 pts/)).toBeInTheDocument();
  });

  it('renders without crashing when value exceeds target', () => {
    // Progress clamping is visual only (ring segment). Center still shows raw value.
    render(<DonutWidget config={{ value: 150, target: 100, unit: '%' }} title="Test" />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders without crashing when target is zero', () => {
    // Guards against division-by-zero in the progress computation.
    render(<DonutWidget config={{ value: 50, target: 0 }} title="Test" />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('of goal')).toBeInTheDocument();
  });

  it('renders optional trend text when provided', () => {
    render(
      <DonutWidget
        config={{
          value: 72,
          target: 85,
          unit: '%',
          trend: 'Trending up 5.2% this year',
          trendDirection: 'up',
        }}
        title="Test"
      />,
    );
    expect(screen.getByText('Trending up 5.2% this year')).toBeInTheDocument();
  });
});
