import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2Landing } from '../V2Landing';

describe('V2Landing', () => {
  it('renders the hero heading', () => {
    render(<V2Landing />);

    expect(screen.getByText(/share your strategic plan with the world/i)).toBeInTheDocument();
  });

  it('renders hero description', () => {
    render(<V2Landing />);

    expect(screen.getByText(/beautiful, interactive dashboards/i)).toBeInTheDocument();
  });

  it('renders Get Started Free CTA button', () => {
    render(<V2Landing />);

    const ctaLink = screen.getByText('Get Started Free');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/signup?redirect=/v2/onboard');
  });

  it('renders View Pricing link', () => {
    render(<V2Landing />);

    const pricingLink = screen.getByText('View Pricing');
    expect(pricingLink).toBeInTheDocument();
    expect(pricingLink.closest('a')).toHaveAttribute('href', '/v2/pricing');
  });

  it('renders feature sections', () => {
    render(<V2Landing />);

    expect(screen.getByText('Hierarchical Goals')).toBeInTheDocument();
    expect(screen.getByText('Your Brand')).toBeInTheDocument();
    expect(screen.getByText('Import from Excel')).toBeInTheDocument();
  });

  it('renders features section heading', () => {
    render(<V2Landing />);

    expect(screen.getByText('Everything you need to share your strategy')).toBeInTheDocument();
  });
});
