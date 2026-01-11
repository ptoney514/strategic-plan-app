import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { ExpandedGoalPanel } from '../ExpandedGoalPanel';
import type { Goal, Metric } from '../../../lib/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  LayoutGroup: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  scale: vi.fn(),
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  setLineDash: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  roundRect: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock data
const mockGoal: Goal = {
  id: 'goal-1',
  district_id: 'district-1',
  title: 'NDE Academic Classification',
  description: 'Achieve and maintain excellent academic classification ratings from the Nebraska Department of Education.',
  goal_number: '1.2',
  level: 1,
  parent_id: 'objective-1',
  indicator_text: 'on-target',
  overall_progress_custom_value: undefined,
  order_position: 0,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockMetric: Metric = {
  id: 'metric-1',
  goal_id: 'goal-1',
  district_id: 'district-1',
  metric_name: 'NDE Classification Score',
  metric_type: 'number',
  current_value: 100,
  target_value: 100,
  baseline_value: 90,
  is_higher_better: true,
  unit: 'score',
  frequency: 'yearly',
  aggregation_method: 'latest',
  created_at: '2024-01-01',
  updated_at: '2024-06-15',
};

describe('ExpandedGoalPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders goal title and description', () => {
    render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('NDE Academic Classification')).toBeInTheDocument();
    expect(screen.getByText(/Achieve and maintain excellent academic classification/)).toBeInTheDocument();
  });

  it('renders goal number badge', () => {
    render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('1.2')).toBeInTheDocument();
  });

  it('renders close button that calls onClose', () => {
    render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Collapse goal details');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('displays metric value', () => {
    render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    // Value appears multiple times (current value and target value)
    const valueElements = screen.getAllByText('100');
    expect(valueElements.length).toBeGreaterThanOrEqual(1);
  });

  it('displays target value', () => {
    render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Target:/)).toBeInTheDocument();
  });

  it('shows "No metrics defined" when no metrics provided', () => {
    render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('No metrics defined for this goal')).toBeInTheDocument();
  });

  it('renders canvas for chart', () => {
    const { container } = render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('applies the correct color class to badge', () => {
    const { container } = render(
      <ExpandedGoalPanel
        goal={mockGoal}
        metrics={[mockMetric]}
        colorClass="bg-district-red"
        onClose={mockOnClose}
      />
    );

    const badge = container.querySelector('.bg-district-red');
    expect(badge).toBeInTheDocument();
  });
});
