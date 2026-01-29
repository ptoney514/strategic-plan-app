import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DistrictSwitcher } from '../DistrictSwitcher';
import type { District } from '../../../lib/types';

// Mock the hooks and utilities
const mockUseUserDistricts = vi.fn();
vi.mock('../../../hooks/useUserDistricts', () => ({
  useUserDistricts: () => mockUseUserDistricts(),
}));

vi.mock('../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ type: 'district', slug: 'westside' }),
}));

vi.mock('../../../lib/subdomain', () => ({
  buildSubdomainUrlWithPath: (type: string, path?: string, slug?: string) => {
    if (type === 'district' && slug) return `http://${slug}.lvh.me:5173${path || ''}`;
    if (type === 'root') return `http://lvh.me:5173${path || ''}`;
    return 'http://lvh.me:5173';
  },
}));

const mockCurrentDistrict: District = {
  id: 'district-1',
  slug: 'westside',
  name: 'Westside Community Schools',
  tagline: 'Excellence in Education',
  primary_color: '#C03537',
  logo_url: undefined,
  admin_email: 'admin@westside.org',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockDistricts: District[] = [
  mockCurrentDistrict,
  {
    id: 'district-2',
    slug: 'eastside',
    name: 'Eastside School District',
    tagline: 'Preparing for Tomorrow',
    primary_color: '#1E3A8A',
    logo_url: 'https://example.com/eastside-logo.png',
    admin_email: 'admin@eastside.edu',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('DistrictSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user has only one district', () => {
    beforeEach(() => {
      mockUseUserDistricts.mockReturnValue({
        data: [mockCurrentDistrict],
        isLoading: false,
        error: null,
      });
    });

    it('renders static district header (no dropdown)', () => {
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      expect(screen.getByText('Strategic Planning')).toBeInTheDocument();

      // Should NOT have the dropdown trigger
      expect(screen.queryByTestId('district-switcher')).not.toBeInTheDocument();
    });

    it('does not render dropdown chevron', () => {
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      // Static header should not have the dropdown button
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('when user has multiple districts', () => {
    beforeEach(() => {
      mockUseUserDistricts.mockReturnValue({
        data: mockDistricts,
        isLoading: false,
        error: null,
      });
    });

    it('renders current district name and logo', () => {
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      expect(screen.getByText('Strategic Planning')).toBeInTheDocument();
    });

    it('renders dropdown trigger button', () => {
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      expect(screen.getByTestId('district-switcher')).toBeInTheDocument();
    });

    it('shows dropdown with all user districts on click', async () => {
      const user = userEvent.setup();
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      await user.click(screen.getByTestId('district-switcher'));

      await waitFor(() => {
        expect(screen.getByText('Your Districts')).toBeInTheDocument();
        expect(screen.getByText('Eastside School District')).toBeInTheDocument();
        // Westside should appear in both trigger and dropdown
        const westsideElements = screen.getAllByText('Westside Community Schools');
        expect(westsideElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('highlights current district with checkmark', async () => {
      const user = userEvent.setup();
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      await user.click(screen.getByTestId('district-switcher'));

      await waitFor(() => {
        const districtOptions = screen.getAllByTestId('district-option');
        const currentOption = districtOptions.find(
          opt => opt.getAttribute('data-current') === 'true'
        );
        expect(currentOption).toBeInTheDocument();
        expect(currentOption).toHaveTextContent('Westside Community Schools');
      });
    });

    it('navigates to correct subdomain URL when district selected', async () => {
      const user = userEvent.setup();
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      await user.click(screen.getByTestId('district-switcher'));

      await waitFor(() => {
        const eastsideLink = screen.getByText('Eastside School District').closest('a');
        expect(eastsideLink).toHaveAttribute('href', 'http://eastside.lvh.me:5173/admin');
      });
    });

    it('shows "View All Districts" link', async () => {
      const user = userEvent.setup();
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      await user.click(screen.getByTestId('district-switcher'));

      await waitFor(() => {
        const viewAllLink = screen.getByText('View All Districts').closest('a');
        expect(viewAllLink).toBeInTheDocument();
        expect(viewAllLink).toHaveAttribute('href', 'http://lvh.me:5173/dashboard');
      });
    });

    it('displays district initials when no logo_url', () => {
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      // Westside has no logo, should show "WE" initials
      expect(screen.getByText('WE')).toBeInTheDocument();
    });
  });

  describe('when loading', () => {
    it('renders static header while loading districts', () => {
      mockUseUserDistricts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      // Should not be a dropdown while loading
      expect(screen.queryByTestId('district-switcher')).not.toBeInTheDocument();
    });
  });

  describe('when no districts returned', () => {
    it('renders static header when districts is empty array', () => {
      mockUseUserDistricts.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      expect(screen.queryByTestId('district-switcher')).not.toBeInTheDocument();
    });

    it('renders static header when districts is null', () => {
      mockUseUserDistricts.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      expect(screen.queryByTestId('district-switcher')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseUserDistricts.mockReturnValue({
        data: mockDistricts,
        isLoading: false,
        error: null,
      });
    });

    it('closes menu on Escape key', async () => {
      const user = userEvent.setup();
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      // Open menu
      await user.click(screen.getByTestId('district-switcher'));
      await waitFor(() => {
        expect(screen.getByText('Your Districts')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Your Districts')).not.toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DistrictSwitcher currentDistrict={mockCurrentDistrict} />);

      // Focus and open with Enter
      const button = screen.getByTestId('district-switcher');
      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Your Districts')).toBeInTheDocument();
      });
    });
  });

  describe('custom className', () => {
    it('applies custom className to component', () => {
      mockUseUserDistricts.mockReturnValue({
        data: mockDistricts,
        isLoading: false,
        error: null,
      });

      render(
        <DistrictSwitcher
          currentDistrict={mockCurrentDistrict}
          className="custom-class"
        />
      );

      const button = screen.getByTestId('district-switcher');
      expect(button).toHaveClass('custom-class');
    });
  });
});
