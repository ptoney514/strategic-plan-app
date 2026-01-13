import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { GoalsOverviewGrid } from '../GoalsOverviewGrid';
import type { Goal, Metric } from '../../../lib/types';

// Mock Supabase client to avoid env var errors
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock the metrics hook to avoid service layer imports
vi.mock('../../../hooks/useMetrics', () => ({
  useMetricChartData: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, id, ...props }: React.PropsWithChildren<{ className?: string; id?: string }>) => (
      <div className={className} id={id} {...props}>{children}</div>
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

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

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
  const mockOnExpandChange = vi.fn();

  beforeEach(() => {
    mockOnMobileGoalSelect.mockClear();
    mockOnExpandChange.mockClear();
  });

  it('renders correct number of goal cards', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
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
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-3');
  });

  it('calls onExpandChange when card is clicked on desktop', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
      />
    );

    // Click on goal 1 card
    const goalCard = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard);

    // Should call onExpandChange with goal id
    expect(mockOnExpandChange).toHaveBeenCalledWith('goal-1');
  });

  it('expands card when expandedGoalId prop is set', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Should show expanded panel with close button
    expect(screen.getByLabelText('Collapse goal details')).toBeInTheDocument();
  });

  it('calls onExpandChange(null) when close button clicked', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Click close button
    const closeButton = screen.getByLabelText('Collapse goal details');
    fireEvent.click(closeButton);

    // Should call onExpandChange with null
    expect(mockOnExpandChange).toHaveBeenCalledWith(null);
  });

  it('calls onExpandChange(null) when clicking expanded card again (toggle)', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Click close button (which is the action for the expanded card)
    const closeButton = screen.getByLabelText('Collapse goal details');
    fireEvent.click(closeButton);

    // Should call onExpandChange with null (toggle off)
    expect(mockOnExpandChange).toHaveBeenCalledWith(null);
  });

  it('calls onExpandChange with new goal id when clicking different card', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Click on goal 2 card (should switch expansion)
    const goalCard2 = screen.getByRole('button', { name: /Goal 1.2/i });
    fireEvent.click(goalCard2);

    // Should call onExpandChange with goal-2
    expect(mockOnExpandChange).toHaveBeenCalledWith('goal-2');
  });

  it('delegates to mobile handler on mobile', () => {
    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={true}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
      />
    );

    // Click on goal card
    const goalCard = screen.getByRole('button', { name: /Goal 1.1/i });
    fireEvent.click(goalCard);

    // Should call mobile handler instead of onExpandChange
    expect(mockOnMobileGoalSelect).toHaveBeenCalledWith('goal-1');
    expect(mockOnExpandChange).not.toHaveBeenCalled();

    // Should not show expanded panel
    expect(screen.queryByLabelText('Collapse goal details')).not.toBeInTheDocument();
  });

  it('adds id attribute to card containers for scroll targeting', () => {
    const { container } = render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={mockOnMobileGoalSelect}
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
      />
    );

    // Check that card containers have id attributes
    expect(container.querySelector('#goal-card-goal-1')).toBeInTheDocument();
    expect(container.querySelector('#goal-card-goal-2')).toBeInTheDocument();
    expect(container.querySelector('#goal-card-goal-3')).toBeInTheDocument();
  });
});
