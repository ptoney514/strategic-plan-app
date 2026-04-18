import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { ChartTooltip } from '../ChartTooltip';

describe('ChartTooltip', () => {
  it('returns null when not active', () => {
    const { container } = render(
      <ChartTooltip active={false} payload={[]} label="Q1" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when payload is empty', () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[]} label="Q1" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders label and value when active with payload', () => {
    render(
      <ChartTooltip
        active={true}
        payload={[{ value: 78, name: 'value', color: '#b85c38' }]}
        label="Mar 2026"
      />
    );
    expect(screen.getByText('Mar 2026')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('renders multiple payload entries', () => {
    render(
      <ChartTooltip
        active={true}
        payload={[
          { value: 78, name: 'series_0', color: '#b85c38' },
          { value: 65, name: 'series_1', color: '#8a8a8a' },
        ]}
        label="Q2"
      />
    );
    expect(screen.getByText('Q2')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
  });
});
