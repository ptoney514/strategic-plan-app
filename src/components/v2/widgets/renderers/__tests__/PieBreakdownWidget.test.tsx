import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { PieBreakdownWidget } from '../PieBreakdownWidget';

describe('PieBreakdownWidget', () => {
  it('renders "No data available" when no breakdown items', () => {
    render(<PieBreakdownWidget config={{}} title="Test" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders legend labels', () => {
    render(
      <PieBreakdownWidget
        config={{
          breakdownItems: [
            { label: 'Math', value: 40, color: '#ff0000' },
            { label: 'Science', value: 30, color: '#00ff00' },
            { label: 'English', value: 30, color: '#0000ff' },
          ],
        }}
        title="Test"
      />
    );
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('renders without crashing with single item', () => {
    const { container } = render(
      <PieBreakdownWidget
        config={{
          breakdownItems: [{ label: 'Only', value: 100, color: '#333' }],
        }}
        title="Test"
      />
    );
    expect(container).toBeTruthy();
  });
});
