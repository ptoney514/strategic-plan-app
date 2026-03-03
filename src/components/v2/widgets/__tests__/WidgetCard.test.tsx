import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { WidgetCard } from '../WidgetCard';
import type { Widget } from '../../../../lib/types/v2';

const mockWidget: Widget = {
  id: 'w-1',
  organizationId: 'org-1',
  planId: 'plan-1',
  type: 'big-number',
  title: 'Student Enrollment',
  subtitle: 'Current year',
  config: { value: 1500, unit: 'students', trend: '+5%', trendDirection: 'up' },
  position: 0,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('WidgetCard', () => {
  it('renders widget title', () => {
    render(<WidgetCard widget={mockWidget} />);
    expect(screen.getByText('Student Enrollment')).toBeInTheDocument();
  });

  it('renders widget subtitle', () => {
    render(<WidgetCard widget={mockWidget} />);
    expect(screen.getByText('Current year')).toBeInTheDocument();
  });

  it('renders type badge', () => {
    render(<WidgetCard widget={mockWidget} />);
    expect(screen.getByText('Big Number')).toBeInTheDocument();
  });

  it('renders the renderer content', () => {
    render(<WidgetCard widget={mockWidget} />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('shows edit button on hover', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<WidgetCard widget={mockWidget} onEdit={onEdit} />);

    const card = screen.getByText('Student Enrollment').closest('div[class*="rounded-xl"]')!;
    await user.hover(card);

    const editBtn = screen.getByLabelText('Edit widget');
    expect(editBtn).toBeInTheDocument();
  });

  it('shows delete button on hover', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<WidgetCard widget={mockWidget} onDelete={onDelete} />);

    const card = screen.getByText('Student Enrollment').closest('div[class*="rounded-xl"]')!;
    await user.hover(card);

    const deleteBtn = screen.getByLabelText('Delete widget');
    expect(deleteBtn).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<WidgetCard widget={mockWidget} onEdit={onEdit} />);

    const card = screen.getByText('Student Enrollment').closest('div[class*="rounded-xl"]')!;
    fireEvent.mouseEnter(card);

    fireEvent.click(screen.getByLabelText('Edit widget'));
    expect(onEdit).toHaveBeenCalledWith(mockWidget);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<WidgetCard widget={mockWidget} onDelete={onDelete} />);

    const card = screen.getByText('Student Enrollment').closest('div[class*="rounded-xl"]')!;
    fireEvent.mouseEnter(card);

    fireEvent.click(screen.getByLabelText('Delete widget'));
    expect(onDelete).toHaveBeenCalledWith(mockWidget);
  });
});
