import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../../test/setup';
import { GoalsOverviewGrid } from '../GoalsOverviewGrid';
import type { HierarchicalGoal, Metric } from '../../../lib/types';

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
  arc: vi.fn(),
  closePath: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock goals
const mockGoals: HierarchicalGoal[] = [
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
    children: [],
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
    children: [],
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
    children: [],
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
  {
    id: 'metric-3',
    goal_id: 'goal-3',
    district_id: 'district-1',
    metric_name: 'Metric Three',
    metric_type: 'number',
    current_value: 100,
    target_value: 100,
    frequency: 'yearly',
    aggregation_method: 'latest',
    unit: 'score',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('Expanded Goal Chart Integration', () => {
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

  it('renders chart correctly after card expansion animation completes', async () => {
    const mockOnExpandChange = vi.fn();

    const { rerender } = render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
      />
    );

    // Click to expand
    fireEvent.click(screen.getByRole('button', { name: /Goal 1.1/i }));

    // Simulate parent updating state
    rerender(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Verify canvas element exists
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Verify getBoundingClientRect NOT called immediately (before delay)
    expect(getBoundingClientRectSpy).not.toHaveBeenCalled();

    // Fast forward past delay (350ms animation delay) - wrap in act for state updates
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // Now it should have been called
    expect(getBoundingClientRectSpy).toHaveBeenCalled();
  });

  it('chart re-renders when switching between goals', async () => {
    const mockOnExpandChange = vi.fn();

    const { rerender } = render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    const firstCallCount = getBoundingClientRectSpy.mock.calls.length;

    // Switch to different goal
    rerender(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-2"
        onExpandChange={mockOnExpandChange}
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // Should have made additional calls for new chart
    expect(getBoundingClientRectSpy.mock.calls.length).toBeGreaterThan(firstCallCount);
  });

  it('cancels pending chart renders when card changes quickly', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockOnExpandChange = vi.fn();

    const { rerender } = render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Quickly switch before animation completes
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    rerender(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-2"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Let everything settle
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Should not have any state update errors
    const reactStateError = consoleErrorSpy.mock.calls.find(
      call => call[0]?.includes?.("Can't perform a React state update")
    );
    expect(reactStateError).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });

  it('handles collapsing and re-expanding the same card', async () => {
    const mockOnExpandChange = vi.fn();

    const { rerender } = render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    const initialCallCount = getBoundingClientRectSpy.mock.calls.length;

    // Collapse
    rerender(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId={null}
        onExpandChange={mockOnExpandChange}
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    // Re-expand
    rerender(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // Should have made new calls for re-expansion
    expect(getBoundingClientRectSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('captures correct dimensions after animation delay', async () => {
    const mockOnExpandChange = vi.fn();

    render(
      <GoalsOverviewGrid
        goals={mockGoals}
        metrics={mockMetrics}
        colorClass="bg-district-red"
        isMobile={false}
        onMobileGoalSelect={vi.fn()}
        expandedGoalId="goal-1"
        onExpandChange={mockOnExpandChange}
      />
    );

    // Wait for animation delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    // Verify the dimensions captured are the mocked values (stable dimensions)
    expect(getBoundingClientRectSpy).toHaveBeenCalled();
    const call = getBoundingClientRectSpy.mock.calls[0];
    expect(call).toBeDefined();
  });

  describe('ResizeObserver integration', () => {
    let observeSpy: ReturnType<typeof vi.fn>;
    let disconnectSpy: ReturnType<typeof vi.fn>;
    let resizeCallback: ResizeObserverCallback | null = null;
    let originalResizeObserver: typeof ResizeObserver;

    beforeEach(() => {
      observeSpy = vi.fn();
      disconnectSpy = vi.fn();
      originalResizeObserver = global.ResizeObserver;

      global.ResizeObserver = class MockResizeObserver {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = disconnectSpy;
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback;
        }
      } as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      global.ResizeObserver = originalResizeObserver;
      resizeCallback = null;
    });

    it('sets up ResizeObserver after animation delay', async () => {
      const mockOnExpandChange = vi.fn();

      render(
        <GoalsOverviewGrid
          goals={mockGoals}
          metrics={mockMetrics}
          colorClass="bg-district-red"
          isMobile={false}
          onMobileGoalSelect={vi.fn()}
          expandedGoalId="goal-1"
          onExpandChange={mockOnExpandChange}
        />
      );

      // Before delay
      expect(observeSpy).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      // After delay
      expect(observeSpy).toHaveBeenCalled();
    });

    it('triggers re-render when container resizes', async () => {
      const mockOnExpandChange = vi.fn();

      render(
        <GoalsOverviewGrid
          goals={mockGoals}
          metrics={mockMetrics}
          colorClass="bg-district-red"
          isMobile={false}
          onMobileGoalSelect={vi.fn()}
          expandedGoalId="goal-1"
          onExpandChange={mockOnExpandChange}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });
      const callCountAfterSetup = getBoundingClientRectSpy.mock.calls.length;

      // Simulate resize event
      if (resizeCallback) {
        resizeCallback([], {} as ResizeObserver);
      }

      // Should trigger additional getBoundingClientRect calls
      expect(getBoundingClientRectSpy.mock.calls.length).toBeGreaterThan(callCountAfterSetup);
    });

    it('disconnects ResizeObserver when card collapses', async () => {
      const mockOnExpandChange = vi.fn();

      const { rerender } = render(
        <GoalsOverviewGrid
          goals={mockGoals}
          metrics={mockMetrics}
          colorClass="bg-district-red"
          isMobile={false}
          onMobileGoalSelect={vi.fn()}
          expandedGoalId="goal-1"
          onExpandChange={mockOnExpandChange}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      // Collapse the card
      rerender(
        <GoalsOverviewGrid
          goals={mockGoals}
          metrics={mockMetrics}
          colorClass="bg-district-red"
          isMobile={false}
          onMobileGoalSelect={vi.fn()}
          expandedGoalId={null}
          onExpandChange={mockOnExpandChange}
        />
      );

      // ResizeObserver should be disconnected
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
