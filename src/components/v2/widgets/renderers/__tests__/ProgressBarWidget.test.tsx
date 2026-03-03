import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { ProgressBarWidget } from '../ProgressBarWidget';

describe('ProgressBarWidget', () => {
  it('renders value / target text', () => {
    render(<ProgressBarWidget config={{ value: 75, target: 100 }} title="Test" />);
    expect(screen.getByText('75 / 100')).toBeInTheDocument();
  });

  it('renders percentage', () => {
    render(<ProgressBarWidget config={{ value: 50, target: 200 }} title="Test" />);
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<ProgressBarWidget config={{ value: 10, target: 50, label: 'Enrollment' }} title="Test" />);
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
  });

  it('clamps at 100%', () => {
    render(<ProgressBarWidget config={{ value: 200, target: 100 }} title="Test" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles zero target', () => {
    render(<ProgressBarWidget config={{ value: 50, target: 0 }} title="Test" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
