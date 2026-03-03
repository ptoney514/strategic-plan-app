import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/setup';
import { ColorPicker } from '../ColorPicker';

describe('ColorPicker', () => {
  it('renders the label', () => {
    render(<ColorPicker label="Primary Color" value="#0099CC" onChange={vi.fn()} />);

    expect(screen.getByText('Primary Color')).toBeInTheDocument();
  });

  it('dispatches onChange when color input changes', () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Primary Color" value="#0099CC" onChange={onChange} />);

    const colorInput = screen.getByTestId('color-input-Primary Color');
    fireEvent.input(colorInput, { target: { value: '#ff0000' } });

    expect(onChange).toHaveBeenCalledWith('#ff0000');
  });

  it('dispatches onChange for valid hex in text input', () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Primary Color" value="#0099CC" onChange={onChange} />);

    const hexInput = screen.getByTestId('hex-input-Primary Color');
    fireEvent.blur(hexInput, { target: { value: '#AABBCC' } });

    expect(onChange).toHaveBeenCalledWith('#AABBCC');
  });

  it('does not dispatch onChange for invalid hex', () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Primary Color" value="#0099CC" onChange={onChange} />);

    const hexInput = screen.getByTestId('hex-input-Primary Color');
    fireEvent.blur(hexInput, { target: { value: 'abc' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('dispatches onChange when a preset swatch is clicked', async () => {
    const onChange = vi.fn();
    render(<ColorPicker label="Primary Color" value="#0099CC" onChange={onChange} />);

    const swatch = screen.getByLabelText('Select color #DC2626');
    fireEvent.click(swatch);

    expect(onChange).toHaveBeenCalledWith('#DC2626');
  });

  it('renders preset color swatches', () => {
    render(<ColorPicker label="Primary Color" value="#0099CC" onChange={vi.fn()} />);

    const presets = screen.getByTestId('presets-Primary Color');
    expect(presets.children).toHaveLength(6);
  });
});
