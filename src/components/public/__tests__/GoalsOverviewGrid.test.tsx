import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { GoalsOverviewGrid } from '../GoalsOverviewGrid';
import type { Goal, Metric } from '../../../lib/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>{children}</div>
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

// Mock goals
const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    district_id: 'district-1',
    title: 'Goal One',
    description: 'Description for goal one',
    goal_number: '1.1',
    level: 1,
    parent_id: 'objective-1',
    indicator_text: 'on-target',
    overall_progress_custom_value: undefined,
    order_position: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'goal-2',
    district_id: 'district-1',
    title: 'Goal Two',
    description: 'Description for goal two',
    goal_number: '1.2',
    level: 1,
    parent_id: 'objective-1',
    indicator_text: 'on-target',
    overall_progress_custom_value: undefined,
    order_position: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'goal-3',
    district_id: 'district-1',
    title: 'Goal Three',
    description: 'Description for goal three',
    goal_number: '1.3',
    level: 1,
    parent_id: 'objective-1',
    indicator_text: 'on-target',
    overall_progress_custom_value: undefined,
    order_position: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockMetrics: Metric[] = [
  {
    id: 'metric-1',
    goal_id: 'goal-1',
    district_id: 'district-1',
    metric_name: 'Metric One',
    metric_type: 'percent',
    is_percentage: true,
    current_value: 85,
    target_value: 90,
    frequency: 'yearly',
    aggregation_method: 'average',
    unit: '%',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'metric-2',
    goal_id: 'goal-2',
    district_id: 'district-1',
    metric_name: 'Metric Two',
    metric_type: 'rating',
    current_value: 4.2,
    target_value: 4.0,
    frequency: 'yearly',
    aggregation_method: 'average',
    unit: 'rating',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('GoalsOverviewGrid', () => {
  const mockOnMobileGoalSelect = vi.fn();

  beforeEach(() => {
    mockOnMobileGoalSelect.mockClear();
  });

  it('renders correct number of goal cards', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    expect(screen.getByText('Goal One')).toBeInTheDocument();
    expect(screen.getByText('Goal Two')).toBeInTheDocument();
    expect(screen.getByText('Goal Three')).toBeInTheDocument();
  });

  it('renders 3-column grid on desktop', () => {
    const { container } = render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-3');
  });

  it('expands card when clicked on desktop', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    // Click on goal 1 card
    const goalCard = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard);

    // Should show expanded panel with close button
    expect(screen.getByLabelText('Collapse goal details')).toBeInTheDocument();
  });

  it('collapses card when close button clicked', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    // Click to expand
    const goalCard = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard);

    // Click close button
    const closeButton = screen.getByLabelText('Collapse goal details');
    fireEvent.click(closeButton);

    // Should not have expanded panel anymore
    expect(screen.queryByLabelText('Collapse goal details')).not.toBeInTheDocument();
  });

  it('only allows one expanded card at a time', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    // Click on goal 1 card
    const goalCard1 = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard1);

    // Verify goal 1 is expanded
    expect(screen.getByLabelText('Collapse goal details')).toBeInTheDocument();

    // Click on goal 2 card (should collapse goal 1 and expand goal 2)
    const goalCard2 = screen.getByRole('button', { name: /Goal 1.2/i });
    fireEvent.click(goalCard2);

    // Should only have one close button (for goal 2)
    const closeButtons = screen.getAllByLabelText('Collapse goal details');
    expect(closeButtons).toHaveLength(1);
  });

  it('delegates to mobile handler on mobile', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={true}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    // Click on goal card
    const goalCard = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard);

    // Should call mobile handler instead of expanding inline
    expect(mockOnMobileGoalSelect).toHaveBeenCalledWith('goal-1');

    // Should not show expanded panel
    expect(screen.queryByLabelText('Collapse goal details')).not.toBeInTheDocument();
  });

  it('collapses card when clicking same card again', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
      />
    );

    // Click to expand
    const goalCard = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard);

    // Verify expanded
    expect(screen.getByLabelText('Collapse goal details')).toBeInTheDocument();

    // Click close button (simulates clicking the card area)
    const closeButton = screen.getByLabelText('Collapse goal details');
    fireEvent.click(closeButton);

    // Should collapse
    expect(screen.queryByLabelText('Collapse goal details')).not.toBeInTheDocument();
  });
});
