import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2Landing } from '../V2Landing';

describe('V2Landing', () => {
  it('renders the hero heading', () => {
    render(<V2Landing />);

    expect(
      screen.getByRole('heading', {
        name: /your strategic plan deserves better than a pdf\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hero description', () => {
    render(<V2Landing />);

    expect(
      screen.getByText(/transform static documents into interactive, branded dashboards/i),
    ).toBeInTheDocument();
  });

  it('renders Book a demo CTA button', () => {
    render(<V2Landing />);

    const ctaLink = screen
      .getAllByText('Book a demo')
      .map((node) => node.closest('a'))
      .find((link) => link?.getAttribute('href')?.startsWith('mailto:'));

    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute(
      'href',
      'mailto:sales@stratadash.org?subject=StrataDash%20demo',
    );
  });

  it('renders live example link', () => {
    render(<V2Landing />);

    const exampleLink = screen.getByText('View a live district example');
    expect(exampleLink).toBeInTheDocument();
    expect(exampleLink.closest('a')).toHaveAttribute('href', '/district/westside');
  });

  it('renders core section headings', () => {
    render(<V2Landing />);

    expect(screen.getByText('Why upgrade from a PDF?')).toBeInTheDocument();
    expect(screen.getByText('Go live in three steps')).toBeInTheDocument();
    expect(screen.getByText('Frequently asked questions')).toBeInTheDocument();
  });
});
