import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { AppearancePreview } from '../AppearancePreview';

describe('AppearancePreview', () => {
  const defaultProps = {
    districtName: 'Westside District',
    primaryColor: '#0099CC',
    secondaryColor: '#FFB800',
  };

  it('renders the district name', () => {
    render(<AppearancePreview {...defaultProps} />);

    expect(screen.getByTestId('preview-name')).toHaveTextContent('Westside District');
  });

  it('applies primary color as background on header bar', () => {
    render(<AppearancePreview {...defaultProps} />);

    const header = screen.getByTestId('preview-header');
    expect(header).toHaveStyle({ backgroundColor: '#0099CC' });
  });

  it('shows logo image when logoUrl is provided', () => {
    render(<AppearancePreview {...defaultProps} logoUrl="https://example.com/logo.png" />);

    const logo = screen.getByTestId('preview-logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('shows initials circle when no logoUrl', () => {
    render(<AppearancePreview {...defaultProps} />);

    const initials = screen.getByTestId('preview-initials');
    expect(initials).toHaveTextContent('WD');
    expect(screen.queryByTestId('preview-logo')).not.toBeInTheDocument();
  });

  it('shows tagline when provided', () => {
    render(<AppearancePreview {...defaultProps} tagline="Empowering learners" />);

    expect(screen.getByTestId('preview-tagline')).toHaveTextContent('Empowering learners');
  });
});
