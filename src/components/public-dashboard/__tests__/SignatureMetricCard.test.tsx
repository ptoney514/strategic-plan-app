import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/setup';
import { SignatureMetricCard } from '../SignatureMetricCard';

const baseProps = {
  title: 'ELA / Reading Proficiency',
  status: 'in-progress' as const,
  displayValue: '72',
  displayUnit: '%',
  supportingLine: 'Up from 65% baseline · Target 85%',
  accentColor: '#2E5BD9',
  target: 85,
  targetLabel: 'TARGET · 85%',
  series: [
    { year: "'21", value: 62 },
    { year: "'22", value: 65 },
    { year: "'23", value: 67 },
    { year: "'24", value: 69 },
    { year: "'25", value: 70 },
    { year: "'26", value: 72 },
  ],
};

describe('SignatureMetricCard', () => {
  it('renders the title and default eyebrow', () => {
    render(<SignatureMetricCard {...baseProps} />);

    expect(screen.getByText('ELA / Reading Proficiency')).toBeInTheDocument();
    expect(screen.getByText(/signature metric/i)).toBeInTheDocument();
  });

  it('renders a custom eyebrow when provided', () => {
    render(<SignatureMetricCard {...baseProps} eyebrow="Headline number" />);

    expect(screen.getByText('Headline number')).toBeInTheDocument();
  });

  it('renders the display value and unit', () => {
    render(<SignatureMetricCard {...baseProps} />);

    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders the supporting line', () => {
    render(<SignatureMetricCard {...baseProps} />);

    expect(
      screen.getByText('Up from 65% baseline · Target 85%')
    ).toBeInTheDocument();
  });

  it('renders a status chip with the matching status class', () => {
    const { container } = render(
      <SignatureMetricCard {...baseProps} status="on-track" />
    );

    expect(container.querySelector('.chip.chip-on-track')).toBeInTheDocument();
  });

  it('renders the target label inside the sparkline', () => {
    render(<SignatureMetricCard {...baseProps} />);

    expect(screen.getByText('TARGET · 85%')).toBeInTheDocument();
  });

  it('renders one year tick label per series point', () => {
    const { container } = render(<SignatureMetricCard {...baseProps} />);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    baseProps.series.forEach(({ year }) => {
      expect(screen.getByText(year)).toBeInTheDocument();
    });
  });

  it('renders an emphasized dot for the last series point', () => {
    const { container } = render(<SignatureMetricCard {...baseProps} />);

    const circles = container.querySelectorAll('svg circle');
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it('applies the accent color to the sparkline path stroke', () => {
    const { container } = render(<SignatureMetricCard {...baseProps} />);

    const strokePath = container.querySelector('svg path[stroke]');
    expect(strokePath?.getAttribute('stroke')).toBe('#2E5BD9');
  });

  it('renders the sig-card class on the root wrapper', () => {
    const { container } = render(<SignatureMetricCard {...baseProps} />);

    expect(container.querySelector('.sig-card')).toBeInTheDocument();
  });
});
