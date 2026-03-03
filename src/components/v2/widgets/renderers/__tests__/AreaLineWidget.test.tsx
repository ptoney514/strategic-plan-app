import { describe, it, expect } from 'vitest';
import { render } from '@/test/setup';
import { AreaLineWidget } from '../AreaLineWidget';

describe('AreaLineWidget', () => {
  it('renders without crashing with empty config', () => {
    const { container } = render(<AreaLineWidget config={{}} title="Test" />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing with data points', () => {
    const { container } = render(
      <AreaLineWidget
        config={{
          dataPoints: [
            { label: 'Jan', value: 10 },
            { label: 'Feb', value: 20 },
            { label: 'Mar', value: 15 },
          ],
        }}
        title="Test"
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing with custom colors', () => {
    const { container } = render(
      <AreaLineWidget
        config={{
          dataPoints: [{ label: 'A', value: 5 }],
          colors: ['#ff0000'],
        }}
        title="Test"
      />
    );
    expect(container).toBeTruthy();
  });
});
