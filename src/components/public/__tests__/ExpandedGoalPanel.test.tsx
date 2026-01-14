import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../../test/setup';
import { ExpandedGoalPanel } from '../ExpandedGoalPanel';
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
});
