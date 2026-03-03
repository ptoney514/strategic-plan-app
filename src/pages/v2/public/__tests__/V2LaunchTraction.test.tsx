import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2LaunchTraction } from '../V2LaunchTraction';
import type { Widget } from '../../../../lib/types/v2';

vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' as const }),
}));

const mockUseDistrict = vi.fn();
vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: (...args: unknown[]) => mockUseDistrict(...args),
}));

const mockUseWidgets = vi.fn();
vi.mock('../../../../hooks/v2/useWidgets', () => ({
  useWidgets: (...args: unknown[]) => mockUseWidgets(...args),
}));

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
  {
    id: 'w-3',
    organizationId: 'org-1',
    planId: 'plan-1',
    type: 'donut',
    title: 'Inactive Widget',
    config: {},
    position: 2,
    isActive: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('V2LaunchTraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDistrict.mockReturnValue({
      data: { id: 'org-1', name: 'Westside', tagline: 'Excellence in Education', primary_color: '#1e3a5f' },
      isLoading: false,
    });
    mockUseWidgets.mockReturnValue({
      data: mockWidgets,
      isLoading: false,
    });
  });

  it('renders district name in uppercase in header', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('WESTSIDE')).toBeInTheDocument();
  });

  it('renders "LAUNCH TRACTION" text', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText(/LAUNCH TRACTION/)).toBeInTheDocument();
  });

  it('renders tagline', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('Excellence in Education')).toBeInTheDocument();
  });

  it('renders "Download Report" button', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('Download Report')).toBeInTheDocument();
    expect(screen.getByText('Download Report')).toBeDisabled();
  });

  it('renders active widgets', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Graduation Rate')).toBeInTheDocument();
  });

  it('filters out inactive widgets', () => {
    render(<V2LaunchTraction />);
    expect(screen.queryByText('Inactive Widget')).not.toBeInTheDocument();
  });

  it('shows footer text', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('Data updated quarterly.')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseWidgets.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2LaunchTraction />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('dark header has correct background color', () => {
    const { container } = render(<V2LaunchTraction />);
    const header = container.querySelector('[style*="background-color: rgb(30, 30, 46)"]') ||
      container.querySelector('[style*="background-color: #1e1e2e"]');
    expect(header).toBeInTheDocument();
  });
});
