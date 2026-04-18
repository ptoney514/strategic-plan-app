import { describe, expect, it } from 'vitest';
import { render, screen } from '@/test/setup';
import { PublicFooter } from '../PublicFooter';

describe('PublicFooter', () => {
  it('uses stacked mobile classes and real destinations for footer actions', () => {
    render(<PublicFooter />);

    const links = screen.getByTestId('public-footer-links');
    expect(links).toHaveClass('flex-col');

    expect(screen.getByRole('link', { name: /powered by stratadash/i })).toHaveAttribute(
      'href',
      'https://stratadash.org',
    );
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /accessibility/i })).toHaveAttribute(
      'href',
      'mailto:support@stratadash.org?subject=Accessibility%20support%20request',
    );
    expect(screen.getByRole('link', { name: /contact support/i })).toHaveAttribute(
      'href',
      'mailto:support@stratadash.org?subject=Public%20district%20support',
    );
  });
});
