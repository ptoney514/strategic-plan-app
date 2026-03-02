import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { TemplatePicker } from '../TemplatePicker';

describe('TemplatePicker', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading and description', () => {
    render(<TemplatePicker selected="hierarchical" onChange={mockOnChange} />);

    expect(screen.getByText('Choose your dashboard template')).toBeInTheDocument();
    expect(screen.getByText(/pick a layout for your public dashboard/i)).toBeInTheDocument();
  });

  it('renders all three template options', () => {
    render(<TemplatePicker selected="hierarchical" onChange={mockOnChange} />);

    expect(screen.getByText('Hierarchical')).toBeInTheDocument();
    expect(screen.getByText('Metrics Grid')).toBeInTheDocument();
    expect(screen.getByText('Launch Traction')).toBeInTheDocument();
  });

  it('renders template descriptions', () => {
    render(<TemplatePicker selected="hierarchical" onChange={mockOnChange} />);

    expect(screen.getByText(/nested goals and strategies/i)).toBeInTheDocument();
    expect(screen.getByText(/data-focused cards/i)).toBeInTheDocument();
    expect(screen.getByText(/progress-focused timeline/i)).toBeInTheDocument();
  });

  it('calls onChange with template id when clicked', async () => {
    const user = userEvent.setup();
    render(<TemplatePicker selected="hierarchical" onChange={mockOnChange} />);

    await user.click(screen.getByText('Metrics Grid'));

    expect(mockOnChange).toHaveBeenCalledWith('metrics-grid');
  });

  it('calls onChange with launch-traction when clicked', async () => {
    const user = userEvent.setup();
    render(<TemplatePicker selected="hierarchical" onChange={mockOnChange} />);

    await user.click(screen.getByText('Launch Traction'));

    expect(mockOnChange).toHaveBeenCalledWith('launch-traction');
  });

  it('shows change-later message', () => {
    render(<TemplatePicker selected="hierarchical" onChange={mockOnChange} />);

    expect(screen.getByText(/you can change this later/i)).toBeInTheDocument();
  });
});
