import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { BrandStep } from '../BrandStep';

// Mock LogoUpload since it has its own upload logic
vi.mock('@/components/v2/LogoUpload', () => ({
  LogoUpload: ({ label, helpText }: { label?: string; helpText?: string }) => (
    <div data-testid="logo-upload">
      {label && <span>{label}</span>}
      {helpText && <span>{helpText}</span>}
    </div>
  ),
}));

describe('BrandStep', () => {
  const mockOnColorChange = vi.fn();
  const mockOnLogoChange = vi.fn();
  const mockOnLogoRemove = vi.fn();

  const defaultProps = {
    primaryColor: '#0099CC',
    logoUrl: '',
    onColorChange: mockOnColorChange,
    onLogoChange: mockOnLogoChange,
    onLogoRemove: mockOnLogoRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading and description', () => {
    render(<BrandStep {...defaultProps} />);

    expect(screen.getByText('Brand your dashboard')).toBeInTheDocument();
    expect(screen.getByText(/add your colors and logo/i)).toBeInTheDocument();
  });

  it('renders color picker input', () => {
    render(<BrandStep {...defaultProps} />);

    const colorInput = screen.getByDisplayValue('#0099CC');
    expect(colorInput).toBeInTheDocument();
  });

  it('renders primary color label', () => {
    render(<BrandStep {...defaultProps} />);

    expect(screen.getByText('Primary Color')).toBeInTheDocument();
  });

  it('renders preset color swatches', () => {
    render(<BrandStep {...defaultProps} />);

    // Should have preset swatches with aria-labels
    expect(screen.getByLabelText('Select color #0099CC')).toBeInTheDocument();
    expect(screen.getByLabelText('Select color #1E40AF')).toBeInTheDocument();
    expect(screen.getByLabelText('Select color #7C3AED')).toBeInTheDocument();
  });

  it('calls onColorChange when preset swatch is clicked', async () => {
    const user = userEvent.setup();
    render(<BrandStep {...defaultProps} />);

    await user.click(screen.getByLabelText('Select color #DC2626'));

    expect(mockOnColorChange).toHaveBeenCalledWith('#DC2626');
  });

  it('renders hex text input that reflects primaryColor prop', () => {
    render(<BrandStep {...defaultProps} />);

    // There are two inputs that show the color value:
    // - A color-type input
    // - A text input showing the hex value
    const hexInput = screen.getByDisplayValue('#0099CC');
    expect(hexInput).toBeInTheDocument();
    expect(hexInput).toHaveAttribute('type', 'text');
  });

  it('renders color type input', () => {
    const { container } = render(<BrandStep {...defaultProps} />);

    const colorInput = container.querySelector('input[type="color"]');
    expect(colorInput).toBeInTheDocument();
    // Browser normalizes color input values to lowercase
    expect((colorInput as HTMLInputElement).value.toLowerCase()).toBe('#0099cc');
  });

  it('renders logo upload area', () => {
    render(<BrandStep {...defaultProps} />);

    expect(screen.getByTestId('logo-upload')).toBeInTheDocument();
    expect(screen.getByText('Organization Logo')).toBeInTheDocument();
  });

  it('renders preview swatch with selected color', () => {
    const { container } = render(<BrandStep {...defaultProps} />);

    // The preview swatch uses inline style backgroundColor
    // jsdom normalizes hex to rgb, so check for rgb(0, 153, 204) which is #0099CC
    const swatches = container.querySelectorAll('[style*="background-color"]');
    const hasCorrectSwatch = Array.from(swatches).some(
      (el) => {
        const style = el.getAttribute('style') || '';
        return style.includes('rgb(0, 153, 204)') || style.includes('#0099CC') || style.includes('#0099cc');
      },
    );
    expect(hasCorrectSwatch).toBe(true);
  });
});
