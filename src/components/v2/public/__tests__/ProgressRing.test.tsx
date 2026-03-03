import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { ProgressRing } from '../ProgressRing';

describe('ProgressRing', () => {
  it('renders an SVG element with role="img"', () => {
    render(<ProgressRing progress={50} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
  });

  it('shows percentage text', () => {
    render(<ProgressRing progress={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows "0%" when progress is 0', () => {
    render(<ProgressRing progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows "0%" when progress is NaN', () => {
    render(<ProgressRing progress={NaN} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('caps at 100% when progress > 100', () => {
    render(<ProgressRing progress={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('uses custom size prop', () => {
    render(<ProgressRing progress={50} size={80} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');
    expect(svg).toHaveAttribute('viewBox', '0 0 80 80');
  });

  it('uses custom strokeWidth', () => {
    const { container } = render(
      <ProgressRing progress={50} size={40} strokeWidth={5} />
    );
    const circles = container.querySelectorAll('circle');
    // Both track and progress circles should have the custom stroke width
    expect(circles[0]).toHaveAttribute('stroke-width', '5');
    expect(circles[1]).toHaveAttribute('stroke-width', '5');
  });

  it('has aria-label with progress percentage', () => {
    render(<ProgressRing progress={42} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', '42% progress');
  });

  it('rounds fractional progress values', () => {
    render(<ProgressRing progress={33.7} />);
    expect(screen.getByText('34%')).toBeInTheDocument();
  });

  it('clamps negative values to 0', () => {
    render(<ProgressRing progress={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
