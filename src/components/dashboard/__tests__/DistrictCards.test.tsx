import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistrictCards } from '../DistrictCards';
import type { District } from '../../../lib/types';

// Mock the hooks and utilities
const mockUseUserDistricts = vi.fn();
vi.mock('../../../hooks/useUserDistricts', () => ({
  useUserDistricts: () => mockUseUserDistricts(),
}));

vi.mock('../../../lib/subdomain', () => ({
  buildSubdomainUrlWithPath: (type: string, path?: string, slug?: string) => {
    if (type === 'district' && slug) return `http://${slug}.lvh.me:5173${path || ''}`;
    if (type === 'root') return `http://lvh.me:5173${path || ''}`;
    return 'http://lvh.me:5173';
  },
}));

const mockDistricts: District[] = [
  {
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
  },
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

describe('DistrictCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders loading skeleton while fetching', () => {
      mockUseUserDistricts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<DistrictCards />);

      // Should show loading skeleton (animated elements)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('empty/single district state', () => {
    it('renders nothing when user has no districts', () => {
      mockUseUserDistricts.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const { container } = render(<DistrictCards />);

      // Should render nothing (return null)
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when districts is null', () => {
      mockUseUserDistricts.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { container } = render(<DistrictCards />);

      // Should render nothing (return null)
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when user has only one district', () => {
      mockUseUserDistricts.mockReturnValue({
        data: [mockDistricts[0]],
        isLoading: false,
        error: null,
      });

      const { container } = render(<DistrictCards />);

      // Should render nothing (return null) for single district users
      expect(container.firstChild).toBeNull();
    });
  });

  describe('error state', () => {
    it('renders error message when fetch fails', () => {
      mockUseUserDistricts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });

      render(<DistrictCards />);

      expect(
        screen.getByText('Failed to load districts. Please try again.')
      ).toBeInTheDocument();
    });
  });

  describe('with districts', () => {
    beforeEach(() => {
      mockUseUserDistricts.mockReturnValue({
        data: mockDistricts,
        isLoading: false,
        error: null,
      });
    });

    it('renders section heading', () => {
      render(<DistrictCards />);

      expect(screen.getByText('Your Districts')).toBeInTheDocument();
    });

    it('renders card for each district', () => {
      render(<DistrictCards />);

      const cards = screen.getAllByTestId('district-card');
      expect(cards).toHaveLength(2);
    });

    it('displays district name', () => {
      render(<DistrictCards />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      expect(screen.getByText('Eastside School District')).toBeInTheDocument();
    });

    it('displays district slug as subdomain URL', () => {
      render(<DistrictCards />);

      expect(screen.getByText('westside.stratadash.org')).toBeInTheDocument();
      expect(screen.getByText('eastside.stratadash.org')).toBeInTheDocument();
    });

    it('displays district tagline', () => {
      render(<DistrictCards />);

      expect(screen.getByText('Excellence in Education')).toBeInTheDocument();
      expect(screen.getByText('Preparing for Tomorrow')).toBeInTheDocument();
    });

    it('links to correct admin URL', () => {
      render(<DistrictCards />);

      const manageButtons = screen.getAllByText('Manage');
      expect(manageButtons[0].closest('a')).toHaveAttribute(
        'href',
        'http://westside.lvh.me:5173/admin'
      );
      expect(manageButtons[1].closest('a')).toHaveAttribute(
        'href',
        'http://eastside.lvh.me:5173/admin'
      );
    });

    it('links to correct public URL', () => {
      render(<DistrictCards />);

      const viewButtons = screen.getAllByText('View');
      expect(viewButtons[0].closest('a')).toHaveAttribute(
        'href',
        'http://westside.lvh.me:5173/'
      );
      expect(viewButtons[1].closest('a')).toHaveAttribute(
        'href',
        'http://eastside.lvh.me:5173/'
      );
    });

    it('opens public URL in new tab', () => {
      render(<DistrictCards />);

      const viewButtons = screen.getAllByText('View');
      const viewLink = viewButtons[0].closest('a');
      expect(viewLink).toHaveAttribute('target', '_blank');
      expect(viewLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('displays district initials when no logo_url', () => {
      render(<DistrictCards />);

      // Westside has no logo, should show "WE" initials
      expect(screen.getByText('WE')).toBeInTheDocument();
    });

    it('displays logo image when logo_url is present', () => {
      const { container } = render(<DistrictCards />);

      // Eastside has a logo - query by tag since alt="" is decorative
      const logoImages = container.querySelectorAll('img');
      const eastsideLogo = Array.from(logoImages).find(
        img => img.getAttribute('src') === 'https://example.com/eastside-logo.png'
      );
      expect(eastsideLogo).toBeInTheDocument();
    });
  });


  describe('district without tagline', () => {
    it('renders card without tagline section', () => {
      const districtWithoutTagline: District = {
        ...mockDistricts[0],
        tagline: undefined,
      };
      const districtsWithOneNoTagline: District[] = [
        districtWithoutTagline,
        mockDistricts[1], // Include second district so component renders
      ];

      mockUseUserDistricts.mockReturnValue({
        data: districtsWithOneNoTagline,
        isLoading: false,
        error: null,
      });

      render(<DistrictCards />);

      expect(screen.getByText('Westside Community Schools')).toBeInTheDocument();
      // First district has no tagline
      expect(screen.queryByText('Excellence in Education')).not.toBeInTheDocument();
      // Second district still has its tagline
      expect(screen.getByText('Preparing for Tomorrow')).toBeInTheDocument();
    });
  });
});
