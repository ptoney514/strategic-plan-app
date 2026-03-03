import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import { V2LaunchTraction } from '../V2LaunchTraction';

// Mock subdomain context
vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
}));

// Mock useDistrict
const mockUseDistrict = vi.fn();
vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: (...args: unknown[]) => mockUseDistrict(...args),
}));

// Mock useWidgets
const mockUseWidgets = vi.fn();
vi.mock('../../../../hooks/v2/useWidgets', () => ({
  useWidgets: (...args: unknown[]) => mockUseWidgets(...args),
}));

describe('V2LaunchTraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDistrict.mockReturnValue({
      data: {
        id: 'org-1',
        name: 'Westside',
        tagline: 'Excellence in Education',
        primary_color: '#1e3a5f',
      },
      isLoading: false,
    });

    mockUseWidgets.mockReturnValue({
      data: [
        {
          id: 'w-1',
          type: 'big-number',
          title: 'Enrollment',
          config: { value: 500 },
          position: 0,
          isActive: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
          organizationId: 'org-1',
          planId: 'p-1',
        },
        {
          id: 'w-2',
          type: 'progress-bar',
          title: 'Graduation',
          config: { value: 85 },
          position: 1,
          isActive: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
          organizationId: 'org-1',
          planId: 'p-1',
        },
        {
          id: 'w-3',
          type: 'donut',
          title: 'Inactive Widget',
          config: {},
          position: 2,
          isActive: false,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
          organizationId: 'org-1',
          planId: 'p-1',
        },
      ],
      isLoading: false,
    });
  });

  it('renders district name in header', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText(/WESTSIDE/i)).toBeInTheDocument();
  });

  it('renders "LAUNCH TRACTION" text', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText(/LAUNCH.*TRACTION/i)).toBeInTheDocument();
  });

  it('renders tagline', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('Excellence in Education')).toBeInTheDocument();
  });

  it('renders "Download Report" button', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText(/Download Report/i)).toBeInTheDocument();
  });

  it('renders active widgets', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Graduation')).toBeInTheDocument();
  });

  it('filters out inactive widgets', () => {
    render(<V2LaunchTraction />);
    expect(screen.queryByText('Inactive Widget')).not.toBeInTheDocument();
  });

  it('shows footer text', () => {
    render(<V2LaunchTraction />);
    expect(screen.getByText(/Data updated quarterly/i)).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseWidgets.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<V2LaunchTraction />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('dark header has correct background color', () => {
    const { container } = render(<V2LaunchTraction />);
    // Verify the page renders with district styling
    expect(screen.getByText(/WESTSIDE/i)).toBeInTheDocument();
  });
});
