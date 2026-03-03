import { describe, it, expect } from 'vitest';
import { render } from '@/test/setup';
import { BarChartWidget } from '../BarChartWidget';

describe('BarChartWidget', () => {
  it('renders without crashing with empty config', () => {
    const { container } = render(<BarChartWidget config={{}} title="Test" />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing with data points', () => {
    const { container } = render(
      <BarChartWidget
        config={{
          dataPoints: [
            { label: 'Jan', values: [10, 20] },
            { label: 'Feb', values: [15, 25] },
          ],
          legend: ['Series A', 'Series B'],
        }}
        title="Test"
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing with single-value data points', () => {
    const { container } = render(
      <BarChartWidget
        config={{
          dataPoints: [
            { label: 'A', value: 10 },
            { label: 'B', value: 20 },
          ],
        }}
        title="Test"
      />
    );
    expect(container).toBeTruthy();
  });
});
