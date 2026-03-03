import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2WidgetBuilder } from '../V2WidgetBuilder';
import type { Widget } from '../../../../lib/types/v2';

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock useDistrict
vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'district-1', name: 'Test District', slug: 'test-org' },
    isLoading: false,
  }),
}));

// Mock widget hooks
const mockWidgets: Widget[] = [
  {
    id: 'w-1',
    organizationId: 'org-1',
    planId: 'plan-1',
    type: 'big-number',
    title: 'Student Count',
    config: { value: 500 },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();

vi.mock('@/hooks/v2/useWidgets', () => ({
  useWidgets: () => ({
    data: mockWidgets,
    isLoading: false,
  }),
  useCreateWidget: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateWidget: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
  useDeleteWidget: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
}));

describe('V2WidgetBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Widget Builder heading', () => {
    render(<V2WidgetBuilder />);
    expect(screen.getByText('Widget Builder')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<V2WidgetBuilder />);
    expect(screen.getByText(/create and manage dashboard widgets/i)).toBeInTheDocument();
  });

  it('renders Add Widget button', () => {
    render(<V2WidgetBuilder />);
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('renders existing widgets', () => {
    render(<V2WidgetBuilder />);
    expect(screen.getByText('Student Count')).toBeInTheDocument();
  });

  it('opens catalog when Add Widget clicked', async () => {
    const user = userEvent.setup();
    render(<V2WidgetBuilder />);

    await user.click(screen.getByText('Add Widget'));
    expect(screen.getByText('Choose a Widget Type')).toBeInTheDocument();
  });

  it('opens config panel after selecting widget type from catalog', async () => {
    const user = userEvent.setup();
    render(<V2WidgetBuilder />);

    await user.click(screen.getByText('Add Widget'));
    await user.click(screen.getByText('Donut Chart'));

    expect(screen.getByText('Configure Widget')).toBeInTheDocument();
  });

  it('returns to grid when Cancel clicked in config panel', async () => {
    const user = userEvent.setup();
    render(<V2WidgetBuilder />);

    await user.click(screen.getByText('Add Widget'));
    await user.click(screen.getByText('Donut Chart'));
    await user.click(screen.getByText('Cancel'));

    expect(screen.getByText('Student Count')).toBeInTheDocument();
  });
});
