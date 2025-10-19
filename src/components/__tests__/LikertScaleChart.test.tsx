import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LikertScaleChart } from '../LikertScaleChart';

describe('LikertScaleChart', () => {
  const mockData = [
    { year: '2021', value: 3.5 },
    { year: '2022', value: 3.8 },
    { year: '2023', value: 4.2 },
    { year: '2024', value: 4.5 }
  ];

  it('should render with valid data', () => {
    render(<LikertScaleChart data={mockData} />);
    // Chart component should be rendered (ResponsiveContainer is present)
    expect(screen.getByText('Average Score')).toBeInTheDocument();
  });

  it('should show empty state when no data provided', () => {
    render(<LikertScaleChart data={[]} />);
    expect(screen.getByText('No likert scale data available')).toBeInTheDocument();
  });

  it('should calculate average correctly', () => {
    render(<LikertScaleChart data={mockData} showAverage={true} />);
    // Average of [3.5, 3.8, 4.2, 4.5] = 4.00
    expect(screen.getByText('4.00')).toBeInTheDocument();
  });

  it('should display title when provided', () => {
    const title = 'Teacher Satisfaction Survey';
    render(<LikertScaleChart data={mockData} title={title} />);
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('should display description when provided', () => {
    const description = 'Annual survey results from teachers';
    render(<LikertScaleChart data={mockData} description={description} />);
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('should show target value when provided', () => {
    const targetValue = 4.5;
    render(<LikertScaleChart data={mockData} targetValue={targetValue} showAverage={true} />);
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should use custom scale range', () => {
    render(
      <LikertScaleChart
        data={mockData}
        scaleMin={1}
        scaleMax={10}
        scaleLabel="(10 highest)"
        showAverage={true}
      />
    );
    expect(screen.getByText(/Scale: 1-10/)).toBeInTheDocument();
    expect(screen.getByText(/(10 highest)/)).toBeInTheDocument();
  });

  it('should hide average when showAverage is false', () => {
    render(<LikertScaleChart data={mockData} showAverage={false} />);
    expect(screen.queryByText('Average Score')).not.toBeInTheDocument();
  });

  it('should handle edge case with single data point', () => {
    const singleData = [{ year: '2024', value: 4.0 }];
    render(<LikertScaleChart data={singleData} showAverage={true} />);
    expect(screen.getByText('4.00')).toBeInTheDocument();
  });

  it('should handle data with target values', () => {
    const dataWithTargets = [
      { year: '2021', value: 3.5, target: 4.0 },
      { year: '2022', value: 3.8, target: 4.0 }
    ];
    render(<LikertScaleChart data={dataWithTargets} />);
    // Chart should render without errors
    expect(screen.getByText('Average Score')).toBeInTheDocument();
  });
});
