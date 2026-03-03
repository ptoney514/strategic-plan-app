import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { DonutWidget } from '../DonutWidget';

describe('DonutWidget', () => {
  it('renders percentage text', () => {
    render(<DonutWidget config={{ value: 75, target: 100 }} title="Test" />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders value / target text', () => {
    render(<DonutWidget config={{ value: 50, target: 200 }} title="Test" />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<DonutWidget config={{ value: 10, target: 50, label: 'completed' }} title="Test" />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('renders default label when none provided', () => {
    render(<DonutWidget config={{ value: 0, target: 100 }} title="Test" />);
    expect(screen.getByText('of goal')).toBeInTheDocument();
  });

  it('shows unit when provided', () => {
    render(<DonutWidget config={{ value: 50, target: 100, unit: 'pts' }} title="Test" />);
    expect(screen.getByText('pts')).toBeInTheDocument();
  });

  it('clamps progress at 100%', () => {
    render(<DonutWidget config={{ value: 150, target: 100 }} title="Test" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles zero target gracefully', () => {
    render(<DonutWidget config={{ value: 50, target: 0 }} title="Test" />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
