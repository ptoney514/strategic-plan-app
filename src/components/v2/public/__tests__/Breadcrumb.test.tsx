import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { Breadcrumb } from '../Breadcrumb';

const items = [
  { label: 'Strategic Plan 2025', href: '/' },
  { label: 'Academic Excellence', href: '/goals/g-1' },
  { label: 'Reading Proficiency' },
];

describe('Breadcrumb', () => {
  it('renders all item labels', () => {
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
    expect(screen.getByText('Academic Excellence')).toBeInTheDocument();
    expect(screen.getByText('Reading Proficiency')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    render(<Breadcrumb items={items} />);

    const planLink = screen.getByText('Strategic Plan 2025');
    expect(planLink.closest('a')).toHaveAttribute('href', '/');

    const goalLink = screen.getByText('Academic Excellence');
    expect(goalLink.closest('a')).toHaveAttribute('href', '/goals/g-1');
  });

  it('renders plain text for items without href', () => {
    render(<Breadcrumb items={items} />);

    const lastItem = screen.getByText('Reading Proficiency');
    expect(lastItem.tagName).toBe('SPAN');
    expect(lastItem.closest('a')).toBeNull();
  });

  it('renders separators between items', () => {
    const { container } = render(<Breadcrumb items={items} />);

    // Material Symbols renders as <span> with chevron_right text (2 separators for 3 items)
    const separators = container.querySelectorAll('.material-symbols-outlined');
    expect(separators).toHaveLength(2);
  });

  it('applies aria-current="page" to last item', () => {
    render(<Breadcrumb items={items} />);

    const lastItem = screen.getByText('Reading Proficiency');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('has aria-label="Breadcrumb" on nav', () => {
    render(<Breadcrumb items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    expect(nav).toHaveClass('overflow-x-auto');
  });

  it('marks older breadcrumb items to hide on mobile when more than two items exist', () => {
    render(<Breadcrumb items={items} />);

    const firstItem = screen.getByText('Strategic Plan 2025').closest('[data-breadcrumb-item]');
    const middleItem = screen.getByText('Academic Excellence').closest('[data-breadcrumb-item]');
    const lastItem = screen.getByText('Reading Proficiency').closest('[data-breadcrumb-item]');

    expect(firstItem).toHaveAttribute('data-hide-on-mobile', 'true');
    expect(middleItem).toHaveAttribute('data-hide-on-mobile', 'false');
    expect(lastItem).toHaveAttribute('data-hide-on-mobile', 'false');
  });
});
