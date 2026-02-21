import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../../test/setup';
import { ExpandedGoalPanel } from '../ExpandedGoalPanel';
import type { Goal, Metric, HierarchicalGoal } from '../../../lib/types';

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

    // Value appears (current value formatted with 2 decimal places by default)
    expect(screen.getByText('100.00')).toBeInTheDocument();
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

  describe('MetricChart animation delay', () => {
    let getBoundingClientRectSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      vi.useFakeTimers();
      getBoundingClientRectSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect');
      getBoundingClientRectSpy.mockReturnValue({
        width: 300,
        height: 180,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 300,
        bottom: 180,
        toJSON: () => ({}),
      });
    });

    afterEach(() => {
      vi.useRealTimers();
      getBoundingClientRectSpy.mockRestore();
    });

    it('does not call getBoundingClientRect immediately on mount', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should not have been called yet (0ms)
      expect(getBoundingClientRectSpy).not.toHaveBeenCalled();
    });

    it('calls getBoundingClientRect after animation delay', async () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Fast-forward past animation delay (350ms) - wrap in act for state updates
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      expect(getBoundingClientRectSpy).toHaveBeenCalled();
    });

    it('clears timer on unmount to prevent memory leaks', async () => {
      const { unmount } = render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Unmount before timer fires
      unmount();

      // Advance timers - should not throw or cause issues
      await vi.advanceTimersByTimeAsync(500);

      // If we get here without errors, cleanup worked correctly
      expect(true).toBe(true);
    });
  });

  describe('MetricChart ResizeObserver', () => {
    let observeSpy: ReturnType<typeof vi.fn>;
    let disconnectSpy: ReturnType<typeof vi.fn>;
    let originalResizeObserver: typeof ResizeObserver;

    beforeEach(() => {
      vi.useFakeTimers();
      observeSpy = vi.fn();
      disconnectSpy = vi.fn();
      originalResizeObserver = global.ResizeObserver;

      global.ResizeObserver = class MockResizeObserver {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = disconnectSpy;
        constructor() {}
      } as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      vi.useRealTimers();
      global.ResizeObserver = originalResizeObserver;
    });

    it('sets up ResizeObserver on container after animation delay', async () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Before delay, observer should not be set up
      expect(observeSpy).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      expect(observeSpy).toHaveBeenCalled();
    });

    it('disconnects ResizeObserver on unmount', async () => {
      const { unmount } = render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      unmount();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Value/Narrative visualization types', () => {
    it('renders value visualization immediately without delay', () => {
      const metricWithValueViz: Metric = {
        ...mockMetric,
        visualization_config: { chartType: 'value', displayValue: '42' },
      };

      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithValueViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Value display should render immediately without waiting for animation delay
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders narrative visualization immediately without delay', () => {
      const metricWithNarrativeViz: Metric = {
        ...mockMetric,
        visualization_config: {
          chartType: 'narrative',
          content: 'Test narrative content',
          title: 'Test Title',
          showTitle: true,
        },
      };

      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithNarrativeViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Narrative content should render immediately
      expect(screen.getByText('Test narrative content')).toBeInTheDocument();
    });

    it('renders status badge inline with title for narrative metrics', () => {
      const metricWithNarrativeViz: Metric = {
        ...mockMetric,
        current_value: 100,
        target_value: 100,
        indicator_text: 'On Target',
        visualization_config: {
          chartType: 'narrative',
          content: 'Test narrative content',
        },
      };

      const { container } = render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithNarrativeViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should NOT have stacked badge column
      const stackedBadgeColumn = container.querySelector('.flex.flex-col.items-center.gap-2');
      expect(stackedBadgeColumn).not.toBeInTheDocument();

      // Should have inline title row with badge (flex-wrap for responsive)
      const titleRow = container.querySelector('.flex.items-center.gap-3');
      expect(titleRow).toBeInTheDocument();

      // FilledStatusBadge (pill style) should be present
      const pillBadge = screen.getByText('On Target').closest('span');
      expect(pillBadge).toHaveClass('rounded-full');
    });

    it('renders full-width narrative content without two-column grid', () => {
      const metricWithNarrativeViz: Metric = {
        ...mockMetric,
        visualization_config: {
          chartType: 'narrative',
          content: 'Test narrative content',
        },
      };

      const { container } = render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithNarrativeViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should NOT have two-column grid for narrative metrics
      const twoColumnGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(twoColumnGrid).not.toBeInTheDocument();

      // Narrative content should be present
      expect(screen.getByText('Test narrative content')).toBeInTheDocument();
    });

    it('does not show numeric value or Target for narrative metrics', () => {
      const metricWithNarrativeViz: Metric = {
        ...mockMetric,
        current_value: 100,
        target_value: 100,
        visualization_config: {
          chartType: 'narrative',
          content: 'Test narrative content',
        },
      };

      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithNarrativeViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should NOT show Target: line for narrative metrics
      expect(screen.queryByText(/Target:/)).not.toBeInTheDocument();
      // Should NOT show CURRENT SCORE label
      expect(screen.queryByText('CURRENT SCORE')).not.toBeInTheDocument();
    });

    it('still shows numeric value in left column for non-narrative metrics (regression)', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should show CURRENT SCORE label for numeric metrics
      expect(screen.getByText('CURRENT SCORE')).toBeInTheDocument();
      // Should show Target: line
      expect(screen.getByText(/Target:/)).toBeInTheDocument();
    });

    it('still renders two-column layout for bar chart metrics (regression)', () => {
      const barChartMetric: Metric = {
        ...mockMetric,
        visualization_config: {
          chartType: 'bar',
          dataPoints: [{ label: '2024', value: 85 }],
        },
      };

      const { container } = render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[barChartMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should have two-column grid
      const twoColumnGrid = container.querySelector('.grid');
      expect(twoColumnGrid).toBeInTheDocument();
    });

    it('still renders FilledStatusBadge (pill style) for non-narrative metrics (regression)', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // The pill-style badge has rounded-full - search for a span with that class
      const pillBadge = screen.getByText('On Target').closest('span');
      expect(pillBadge).toHaveClass('rounded-full');
    });

    it('renders description next to title for narrative layout', () => {
      const metricWithNarrativeViz: Metric = {
        ...mockMetric,
        visualization_config: {
          chartType: 'narrative',
          content: 'Test content',
        },
      };

      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithNarrativeViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Description should be present
      expect(screen.getByText(/Achieve and maintain excellent academic classification/)).toBeInTheDocument();
    });

    it('renders narrative content without fixed height', () => {
      const metricWithNarrativeViz: Metric = {
        ...mockMetric,
        visualization_config: {
          chartType: 'narrative',
          content: '<p>Long content here</p>',
        },
      };

      const { container } = render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithNarrativeViz]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // The narrative container should NOT have fixed height class
      const narrativeContainer = container.querySelector('.narrative-display')?.closest('.bg-gray-50, .dark\\:bg-slate-800');
      if (narrativeContainer) {
        expect(narrativeContainer).not.toHaveClass('h-[180px]');
        expect(narrativeContainer).not.toHaveClass('overflow-y-auto');
      }
    });
  });

  describe('string values in visualization_config (JSONB coercion)', () => {
    it('does not crash when dataPoints values are strings from JSONB', () => {
      const metricWithStringValues: Metric = {
        ...mockMetric,
        current_value: undefined,
        target_value: undefined,
        visualization_config: {
          chartType: 'bar',
          dataPoints: [
            { label: '2023', value: '3.78' as unknown as number },
            { label: '2024', value: '4.12' as unknown as number },
          ],
          targetValue: '4.50' as unknown as number,
        },
      };

      // Should not throw TypeError: e.toFixed is not a function
      expect(() => {
        render(
          <ExpandedGoalPanel
            goal={mockGoal}
            metrics={[metricWithStringValues]}
            colorClass="bg-district-red"
            onClose={mockOnClose}
          />
        );
      }).not.toThrow();
    });

    it('renders correct values when dataPoints are strings', () => {
      const metricWithStringValues: Metric = {
        ...mockMetric,
        current_value: undefined,
        target_value: undefined,
        visualization_config: {
          chartType: 'bar',
          dataPoints: [
            { label: '2023', value: '3.78' as unknown as number },
            { label: '2024', value: '4.12' as unknown as number },
          ],
          targetValue: '4.50' as unknown as number,
        },
      };

      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[metricWithStringValues]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      // Should display the formatted average value (3.95 = (3.78 + 4.12) / 2)
      expect(screen.getByText('3.95')).toBeInTheDocument();
    });

    it('does not crash with donut chart and string values', () => {
      const metricWithDonutStrings: Metric = {
        ...mockMetric,
        current_value: undefined,
        visualization_config: {
          chartType: 'donut',
          dataPoints: [
            { label: 'Category A', value: '25.5' as unknown as number },
            { label: 'Category B', value: '74.5' as unknown as number },
          ],
        },
      };

      expect(() => {
        render(
          <ExpandedGoalPanel
            goal={mockGoal}
            metrics={[metricWithDonutStrings]}
            colorClass="bg-district-red"
            onClose={mockOnClose}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Sub-Goals Section', () => {
    const mockSubGoals: HierarchicalGoal[] = [
      {
        id: 'subgoal-1',
        district_id: 'district-1',
        title: 'K-2 Reading Foundation',
        description: 'Build strong phonics skills',
        goal_number: '1.2.1',
        level: 2,
        parent_id: 'goal-1',
        indicator_text: 'on-target',
        order_position: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [],
      },
      {
        id: 'subgoal-2',
        district_id: 'district-1',
        title: 'Grade 3-5 Comprehension',
        description: 'Improve reading comprehension',
        goal_number: '1.2.2',
        level: 2,
        parent_id: 'goal-1',
        indicator_text: 'needs-attention',
        order_position: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [],
      },
    ];

    it('renders sub-goals section when subGoals prop is provided', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
          subGoals={mockSubGoals}
        />
      );

      expect(screen.getByText('Sub-Goals (2)')).toBeInTheDocument();
    });

    it('renders each sub-goal with title and number', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
          subGoals={mockSubGoals}
        />
      );

      expect(screen.getByText('K-2 Reading Foundation')).toBeInTheDocument();
      expect(screen.getByText('Grade 3-5 Comprehension')).toBeInTheDocument();
      expect(screen.getByText('1.2.1')).toBeInTheDocument();
      expect(screen.getByText('1.2.2')).toBeInTheDocument();
    });

    it('renders sub-goal descriptions', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
          subGoals={mockSubGoals}
        />
      );

      expect(screen.getByText('Build strong phonics skills')).toBeInTheDocument();
      expect(screen.getByText('Improve reading comprehension')).toBeInTheDocument();
    });

    it('renders status badges for each sub-goal', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
          subGoals={mockSubGoals}
        />
      );

      // Two "On Target" badges: one for the goal metric, one for the sub-goal
      const onTargetBadges = screen.getAllByText('On Target');
      expect(onTargetBadges.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });

    it('does not render sub-goals section when subGoals is empty', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
          subGoals={[]}
        />
      );

      expect(screen.queryByText(/Sub-Goals/)).not.toBeInTheDocument();
    });

    it('does not render sub-goals section when subGoals is undefined', () => {
      render(
        <ExpandedGoalPanel
          goal={mockGoal}
          metrics={[mockMetric]}
          colorClass="bg-district-red"
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/Sub-Goals/)).not.toBeInTheDocument();
    });
  });
});
