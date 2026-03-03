import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/setup';
import { TemplateModeSelector } from '../TemplateModeSelector';

describe('TemplateModeSelector', () => {
  it('renders both template options', () => {
    render(<TemplateModeSelector selected="hierarchical" onChange={vi.fn()} />);

    expect(screen.getByText('Hierarchical')).toBeInTheDocument();
    expect(screen.getByText('Launch Traction')).toBeInTheDocument();
  });

  it('highlights the selected option with aria-checked', () => {
    render(<TemplateModeSelector selected="hierarchical" onChange={vi.fn()} />);

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicking a different option', () => {
    const onChange = vi.fn();
    render(<TemplateModeSelector selected="hierarchical" onChange={onChange} />);

    fireEvent.click(screen.getByText('Launch Traction'));

    expect(onChange).toHaveBeenCalledWith('launch-traction');
  });

  it('both options have accessible radio roles', () => {
    render(<TemplateModeSelector selected="launch-traction" onChange={vi.fn()} />);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });
});
