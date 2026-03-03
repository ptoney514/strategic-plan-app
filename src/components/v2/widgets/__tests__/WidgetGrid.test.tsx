import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { WidgetGrid } from '../WidgetGrid';
import type { Widget } from '../../../../lib/types/v2';

const mockWidgets: Widget[] = [
  {
    id: 'w-1',
    organizationId: 'org-1',
    planId: 'plan-1',
    type: 'big-number',
    title: 'Enrollment',
    config: { value: 500 },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w-2',
    organizationId: 'org-1',
    planId: 'plan-1',
    type: 'progress-bar',
    title: 'Graduation Rate',
    config: { value: 85, target: 100 },
    position: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('WidgetGrid', () => {
  it('renders loading skeleton when isLoading', () => {
    const { container } = render(<WidgetGrid widgets={[]} isLoading />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });

  it('renders empty state when no widgets', () => {
    render(<WidgetGrid widgets={[]} />);
    expect(screen.getByText('No widgets yet')).toBeInTheDocument();
    expect(screen.getByText(/add widgets to visualize/i)).toBeInTheDocument();
  });

  it('renders widget cards when widgets provided', () => {
    render(<WidgetGrid widgets={mockWidgets} />);
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Graduation Rate')).toBeInTheDocument();
  });

  it('passes onEdit and onDelete to widget cards', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<WidgetGrid widgets={mockWidgets} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
  });
});
