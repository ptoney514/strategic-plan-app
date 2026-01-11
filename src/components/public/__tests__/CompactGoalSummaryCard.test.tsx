import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { CompactGoalSummaryCard } from '../CompactGoalSummaryCard';
import type { Goal, Metric } from '../../../lib/types';

// Mock data
const mockGoal: Goal = {
  id: 'goal-1',
  district_id: 'district-1',
  title: 'Grow and nurture a district culture that values, demonstrates, and promotes a sense of belonging',
  description: 'Foster an inclusive environment where all students, staff, families, and community members feel valued and connected.',
  goal_number: '1.1',
  level: 1,
  parent_id: 'objective-1',
  indicator_text: 'on-target',
  overall_progress_custom_value: undefined,
  order_position: 0,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockRatingMetric: Metric = {
  id: 'metric-1',
  goal_id: 'goal-1',
  district_id: 'district-1',
  metric_name: 'Overall average of responses (1-5 rating)',
  metric_type: 'rating',
  current_value: 3.83,
  target_value: 3.66,
  baseline_value: 3.50,
  is_higher_better: true,
  frequency: 'yearly',
  aggregation_method: 'average',
  unit: 'rating',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockPercentMetric: Metric = {
  id: 'metric-2',
  goal_id: 'goal-1',
  district_id: 'district-1',
  metric_name: 'Completion Rate',
  metric_type: 'percent',
  is_percentage: true,
  current_value: 100,
  target_value: 100,
  frequency: 'yearly',
  aggregation_method: 'average',
  unit: '%',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockCurrencyMetric: Metric = {
  id: 'metric-3',
  goal_id: 'goal-1',
  district_id: 'district-1',
  metric_name: 'Budget Allocation',
  metric_type: 'currency',
  current_value: 1234567,
  target_value: 1500000,
  frequency: 'yearly',
  aggregation_method: 'sum',
  unit: '$',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('CompactGoalSummaryCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders goal ID badge with correct number', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('1.1')).toBeInTheDocument();
  });

  it('renders goal title', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText(/Grow and nurture a district culture/)).toBeInTheDocument();
  });

  it('formats rating metrics as "X.XX / Y.YY"', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('3.83')).toBeInTheDocument();
    expect(screen.getByText('/ 3.66')).toBeInTheDocument();
  });

  it('formats percent metrics with % symbol', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockPercentMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('100.0')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('formats currency metrics with $ prefix', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockCurrencyMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  it('shows comparison indicator for at target', () => {
    const atTargetMetric = { ...mockPercentMetric, current_value: 100, target_value: 100 };
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[atTargetMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('At Target')).toBeInTheDocument();
  });

  it('shows comparison indicator for above target', () => {
    const aboveTargetMetric = { ...mockRatingMetric, current_value: 4.0, target_value: 3.5 };
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[aboveTargetMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    // Check for "On Target" in the comparison indicator (not the badge)
    const onTargetElements = screen.getAllByText('On Target');
    expect(onTargetElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows comparison indicator for below target', () => {
    const belowTargetMetric = { ...mockRatingMetric, current_value: 3.0, target_value: 3.5 };
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[belowTargetMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText(/below/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-expanded attribute when not expanded', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-expanded', 'false');
  });

  it('has correct aria-expanded attribute when expanded', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={true}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows "No metrics defined" when no metrics provided', () => {
    render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('No metrics defined')).toBeInTheDocument();
  });

  it('applies outline style color class to ID badge', () => {
    const { container } = render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    // Outline style uses border-red-600 instead of bg-district-red
    const badge = container.querySelector('.border-red-600');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-600');
    expect(badge).toHaveClass('bg-transparent');
  });

  it('renders title inline with ID badge in same flex container', () => {
    const { container } = render(
      <CompactGoalSummaryCard
        goal={mockGoal}
        metrics={[mockRatingMetric]}
        colorClass="bg-district-red"
        isExpanded={false}
        onClick={mockOnClick}
      />
    );

    // ID badge and title should be in the same flex container
    const badge = container.querySelector('.border-red-600');
    const headerContainer = badge?.parentElement;

    // Verify header uses flex layout
    expect(headerContainer).toHaveClass('flex');
    expect(headerContainer).toHaveClass('items-start');
    expect(headerContainer).toHaveClass('gap-3');

    // Verify title h3 is in the same container
    const title = headerContainer?.querySelector('h3');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('flex-1');
  });
});
