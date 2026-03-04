import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2Pricing } from '../V2Pricing';

describe('V2Pricing', () => {
  it('renders the pricing heading', () => {
    render(<V2Pricing />);

    expect(screen.getByText('Simple, transparent pricing')).toBeInTheDocument();
  });

  it('renders pricing description', () => {
    render(<V2Pricing />);

    expect(screen.getByText(/start for free and upgrade as you grow/i)).toBeInTheDocument();
  });

  it('renders all three pricing tiers', () => {
    render(<V2Pricing />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders tier prices', () => {
    render(<V2Pricing />);

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('renders POPULAR badge for Pro tier', () => {
    render(<V2Pricing />);

    expect(screen.getByText('POPULAR')).toBeInTheDocument();
  });

  it('renders CTA buttons for each tier', () => {
    render(<V2Pricing />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
    expect(screen.getByText('Contact Sales')).toBeInTheDocument();
  });

  it('renders feature lists for each tier', () => {
    render(<V2Pricing />);

    // Free tier features
    expect(screen.getByText('Up to 1 plan')).toBeInTheDocument();
    expect(screen.getByText('Community support')).toBeInTheDocument();

    // Pro tier features
    expect(screen.getByText('Unlimited plans')).toBeInTheDocument();
    expect(screen.getByText('Excel import')).toBeInTheDocument();

    // Enterprise features
    expect(screen.getByText('SSO & SAML')).toBeInTheDocument();
    expect(screen.getByText('SLA')).toBeInTheDocument();
  });

  it('links Get Started to signup page', () => {
    render(<V2Pricing />);

    const getStartedLink = screen.getByText('Get Started');
    expect(getStartedLink.closest('a')).toHaveAttribute('href', '/signup?redirect=/onboard');
  });
});
