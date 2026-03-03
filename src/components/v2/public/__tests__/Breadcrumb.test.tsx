import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/setup';
import { Breadcrumb } from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('renders all item labels', () => {
    render(<Breadcrumb items={[{ label: 'Plan' }, { label: 'Overview' }]} />);
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    render(<Breadcrumb items={[{ label: 'Plan', href: '/v2' }, { label: 'Current' }]} />);
    const link = screen.getByText('Plan');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/v2');
  });

  it('renders plain text for items without href', () => {
    render(<Breadcrumb items={[{ label: 'Plan', href: '/v2' }, { label: 'Current' }]} />);
    const text = screen.getByText('Current');
    expect(text.tagName).toBe('SPAN');
  });

  it('renders separators between items', () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'A', href: '/a' }, { label: 'B', href: '/b' }, { label: 'C' }]} />,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });

  it('applies aria-current="page" to last item', () => {
    render(<Breadcrumb items={[{ label: 'Plan', href: '/v2' }, { label: 'Current' }]} />);
    const current = screen.getByText('Current');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('has aria-label="Breadcrumb" on nav', () => {
    render(<Breadcrumb items={[{ label: 'A' }]} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });
});
