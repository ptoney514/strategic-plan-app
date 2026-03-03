import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { WidgetCatalog } from '../WidgetCatalog';

describe('WidgetCatalog', () => {
  it('renders the modal title', () => {
    render(<WidgetCatalog onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Choose a Widget Type')).toBeInTheDocument();
  });

  it('renders all 6 widget type options', () => {
    render(<WidgetCatalog onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Donut Chart')).toBeInTheDocument();
    expect(screen.getByText('Big Number')).toBeInTheDocument();
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Area Line')).toBeInTheDocument();
    expect(screen.getByText('Progress Bar')).toBeInTheDocument();
    expect(screen.getByText('Pie Breakdown')).toBeInTheDocument();
  });

  it('renders descriptions for each type', () => {
    render(<WidgetCatalog onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText(/show progress toward a target/i)).toBeInTheDocument();
    expect(screen.getByText(/display a key metric prominently/i)).toBeInTheDocument();
    expect(screen.getByText(/compare values across categories/i)).toBeInTheDocument();
    expect(screen.getByText(/track trends over time/i)).toBeInTheDocument();
    expect(screen.getByText(/show completion toward a goal/i)).toBeInTheDocument();
    expect(screen.getByText(/show distribution of values/i)).toBeInTheDocument();
  });

  it('calls onSelect with the correct type when a card is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<WidgetCatalog onSelect={onSelect} onClose={vi.fn()} />);

    await user.click(screen.getByText('Donut Chart'));
    expect(onSelect).toHaveBeenCalledWith('donut');
  });

  it('calls onSelect with bar-chart type', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<WidgetCatalog onSelect={onSelect} onClose={vi.fn()} />);

    await user.click(screen.getByText('Bar Chart'));
    expect(onSelect).toHaveBeenCalledWith('bar-chart');
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WidgetCatalog onSelect={vi.fn()} onClose={onClose} />);

    await user.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<WidgetCatalog onSelect={vi.fn()} onClose={onClose} />);

    const backdrop = container.querySelector('.bg-black\\/40')!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
