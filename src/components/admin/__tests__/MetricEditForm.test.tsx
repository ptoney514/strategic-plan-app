import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/setup';
import { MetricEditForm } from '../MetricEditForm';
import type { Metric } from '../../../lib/types';
import { useMetricChartData } from '../../../hooks/useMetrics';

// Mock the useMetricChartData hook
vi.mock('../../../hooks/useMetrics', () => ({
  useMetricChartData: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.PropsWithChildren<{ className?: string }>) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Base metric for testing
const createMockMetric = (overrides: Partial<Metric> = {}): Metric => ({
  id: 'metric-1',
  goal_id: 'goal-1',
  district_id: 'district-1',
  metric_name: 'Test Metric',
  description: 'A test metric description',
  unit: '%',
  frequency: 'yearly',
  aggregation_method: 'average',
  current_value: 85,
  target_value: 90,
  baseline_value: 75,
  indicator_text: 'On Target',
  indicator_color: 'green',
  visualization_config: undefined,
  ...overrides,
});

describe('MetricEditForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default state
    vi.mocked(useMetricChartData).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useMetricChartData>);
  });

  describe('Data Loading', () => {
    it('should load data from visualization_config.dataPoints when available', () => {
      const metricWithVizConfig = createMockMetric({
        visualization_config: {
          dataPoints: [
            { label: '2021', value: 3.66 },
            { label: '2022', value: 3.75 },
            { label: '2023', value: 3.74 },
            { label: '2024', value: 3.83 },
          ],
          chartType: 'bar',
        },
      });

      render(
        <MetricEditForm
          metric={metricWithVizConfig}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Check that data points are displayed
      expect(screen.getByDisplayValue('2021')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2022')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
    });

    it('should fall back to time series data when visualization_config is empty', async () => {
      const metricWithoutVizConfig = createMockMetric({
        visualization_config: undefined,
      });

      // Mock time series data
      vi.mocked(useMetricChartData).mockReturnValue({
        data: [
          { period: '2021', actual: 3.66, target: 3.50 },
          { period: '2022', actual: 3.75, target: 3.60 },
          { period: '2023', actual: 3.74, target: 3.70 },
          { period: '2024', actual: 3.83, target: 3.80 },
        ],
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetricChartData>);

      render(
        <MetricEditForm
          metric={metricWithoutVizConfig}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Wait for the useEffect to populate data points
      await waitFor(() => {
        expect(screen.getByDisplayValue('2021')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('2022')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
    });

    it('should prioritize visualization_config over time series data', () => {
      const metricWithVizConfig = createMockMetric({
        visualization_config: {
          dataPoints: [
            { label: 'Custom1', value: 100 },
            { label: 'Custom2', value: 200 },
          ],
        },
      });

      // Mock time series data that should NOT be used
      vi.mocked(useMetricChartData).mockReturnValue({
        data: [
          { period: '2021', actual: 50, target: 60 },
          { period: '2022', actual: 55, target: 65 },
        ],
        isLoading: false,
        error: null,
      } as ReturnType<typeof useMetricChartData>);

      render(
        <MetricEditForm
          metric={metricWithVizConfig}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should show viz config data, not time series
      expect(screen.getByDisplayValue('Custom1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Custom2')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('2021')).not.toBeInTheDocument();
    });

    it('should show empty state when no data is available', () => {
      const metricWithoutData = createMockMetric({
        visualization_config: undefined,
      });

      render(
        <MetricEditForm
          metric={metricWithoutData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/No data points yet/i)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should display metric name', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Test Metric')).toBeInTheDocument();
    });

    it('should display description', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('A test metric description')).toBeInTheDocument();
    });

    it('should display current value', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('85')).toBeInTheDocument();
    });

    it('should allow editing metric name', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByDisplayValue('Test Metric');
      fireEvent.change(nameInput, { target: { value: 'Updated Metric Name' } });

      expect(screen.getByDisplayValue('Updated Metric Name')).toBeInTheDocument();
    });
  });

  describe('Chart Type Selector', () => {
    it('should display chart type selector', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Bar')).toBeInTheDocument();
      expect(screen.getByText('Line')).toBeInTheDocument();
      expect(screen.getByText('Area')).toBeInTheDocument();
      expect(screen.getByText('Donut')).toBeInTheDocument();
    });

    it('should allow changing chart type', () => {
      const metric = createMockMetric({
        visualization_config: { chartType: 'bar' },
      });
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const lineButton = screen.getByText('Line').closest('button');
      fireEvent.click(lineButton!);

      // The Line button should now be selected (has green styling)
      expect(lineButton).toHaveClass('border-[#10b981]');
    });
  });

  describe('Badge/Status Indicator', () => {
    it('should display badge text input', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText(/On Target, Needs Improvement/i)).toBeInTheDocument();
    });

    it('should display color options', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Color options are displayed as text next to radio buttons
      expect(screen.getByText('green')).toBeInTheDocument();
      expect(screen.getByText('amber')).toBeInTheDocument();
      expect(screen.getByText('red')).toBeInTheDocument();
      expect(screen.getByText('gray')).toBeInTheDocument();
    });

    it('should select the correct color from metric', () => {
      const metric = createMockMetric({ indicator_color: 'amber' });
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Find the radio input with value="amber" and check it's checked
      const amberRadio = screen.getByRole('radio', { name: /amber/i }) as HTMLInputElement;
      expect(amberRadio.checked).toBe(true);
    });
  });

  describe('Data Points Editor', () => {
    it('should allow adding new data points', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const addButton = screen.getByText('Add Data Point');
      fireEvent.click(addButton);

      // Should now have input fields for a new data point
      const yearInputs = screen.getAllByPlaceholderText('2024');
      expect(yearInputs.length).toBeGreaterThan(0);
    });

    it('should allow removing data points', async () => {
      const metricWithData = createMockMetric({
        visualization_config: {
          dataPoints: [
            { label: '2023', value: 3.74 },
            { label: '2024', value: 3.83 },
          ],
        },
      });

      render(
        <MetricEditForm
          metric={metricWithData}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Find and click the first delete button
      const deleteButtons = screen.getAllByTitle('Remove data point');
      fireEvent.click(deleteButtons[0]);

      // Should only have one data point now
      await waitFor(() => {
        expect(screen.queryByDisplayValue('2023')).not.toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
    });
  });

  describe('Form Actions', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call onSave with updated data when save is clicked', async () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Update the metric name
      const nameInput = screen.getByDisplayValue('Test Metric');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Click save
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            metric_name: 'Updated Name',
          })
        );
      });
    });

    it('should show validation error when metric name is empty', async () => {
      const metric = createMockMetric();
      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Clear the metric name
      const nameInput = screen.getByDisplayValue('Test Metric');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Click save
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Metric name is required')).toBeInTheDocument();
      });
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Preview', () => {
    it('should show preview section after clicking Update Preview', async () => {
      const metric = createMockMetric({
        visualization_config: {
          dataPoints: [
            { label: '2024', value: 3.83 },
          ],
        },
      });

      render(
        <MetricEditForm
          metric={metric}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByText('Update Preview'));

      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument();
      });
    });
  });
});
