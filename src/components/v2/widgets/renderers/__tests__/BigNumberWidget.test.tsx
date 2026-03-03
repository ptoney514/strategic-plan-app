import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { BigNumberWidget } from '../BigNumberWidget';

describe('BigNumberWidget', () => {
  it('renders the value', () => {
    render(<BigNumberWidget config={{ value: 1234 }} title="Test" />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders unit text', () => {
    render(<BigNumberWidget config={{ value: 98, unit: '%' }} title="Test" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('renders trend text', () => {
    render(<BigNumberWidget config={{ value: 50, trend: '+12%', trendDirection: 'up' }} title="Test" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('does not render trend when not provided', () => {
    render(<BigNumberWidget config={{ value: 50 }} title="Test" />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it('renders with default value of 0', () => {
    render(<BigNumberWidget config={{}} title="Test" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
