import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../test/setup';
import { SchoolNavItem } from '../SchoolNavItem';
import type { School } from '../../../../lib/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/admin' }),
  };
});

// Mock school data
const mockSchool: School = {
  id: 'school-1',
  district_id: 'dist-1',
  name: 'Washington Elementary',
  slug: 'washington-elementary',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockDraftSchool: School = {
  id: 'school-2',
  district_id: 'dist-1',
  name: 'Lincoln Middle School',
  slug: 'lincoln-middle',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('SchoolNavItem', () => {
  const defaultProps = {
    school: mockSchool,
    districtSlug: 'test-district',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders school name', () => {
    render(<SchoolNavItem {...defaultProps} />);
    expect(screen.getByText('Washington Elementary')).toBeInTheDocument();
  });

  it('expands to show sub-navigation when clicked', () => {
    render(<SchoolNavItem {...defaultProps} />);

    // Click school item to expand
    fireEvent.click(screen.getByText('Washington Elementary'));

    // Sub-navigation should appear
    expect(screen.getByText('Objectives')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('shows draft indicator for non-public schools', () => {
    render(<SchoolNavItem school={mockDraftSchool} districtSlug="test-district" />);

    const draftIndicator = document.querySelector('[title="Draft"]');
    expect(draftIndicator).toBeInTheDocument();
  });

  it('does not show draft indicator for public schools', () => {
    render(<SchoolNavItem {...defaultProps} />);

    const draftIndicator = document.querySelector('[title="Draft"]');
    expect(draftIndicator).not.toBeInTheDocument();
  });

  it('calls onMobileClose when navigating', () => {
    const onMobileClose = vi.fn();
    render(
      <SchoolNavItem
        {...defaultProps}
        onMobileClose={onMobileClose}
      />
    );

    // Click to expand first
    fireEvent.click(screen.getByText('Washington Elementary'));

    // Then click a sub-item
    fireEvent.click(screen.getByText('Objectives'));

    expect(onMobileClose).toHaveBeenCalled();
  });

  it('renders building icon', () => {
    render(<SchoolNavItem {...defaultProps} />);

    // The component should render a Building2 icon
    // We check for SVG element
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('shows chevron icon for expand/collapse state', () => {
    render(<SchoolNavItem {...defaultProps} />);

    // Should show chevron right initially (collapsed)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('shows sub-items with correct icons', () => {
    render(<SchoolNavItem {...defaultProps} />);

    // Expand
    fireEvent.click(screen.getByText('Washington Elementary'));

    // Check that sub-items have icons (Target, Users, Palette)
    expect(screen.getByText('Objectives')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('handles long school names with truncation', () => {
    const longNameSchool: School = {
      ...mockSchool,
      name: 'Very Long School Name That Should Be Truncated In Display',
    };
    render(<SchoolNavItem school={longNameSchool} districtSlug="test-district" />);

    expect(
      screen.getByText('Very Long School Name That Should Be Truncated In Display')
    ).toBeInTheDocument();

    // Check that the text element has truncate class
    const schoolName = screen.getByText(
      'Very Long School Name That Should Be Truncated In Display'
    );
    expect(schoolName).toHaveClass('truncate');
  });

  // Navigation path tests (without district slug in path - subdomain routing)
  describe('navigation paths', () => {
    it('navigates to /schools/{slug}/admin when school is clicked', () => {
      render(<SchoolNavItem {...defaultProps} />);
      fireEvent.click(screen.getByText('Washington Elementary'));
      expect(mockNavigate).toHaveBeenCalledWith('/schools/washington-elementary/admin');
    });

    it('navigates to /schools/{slug}/admin/objectives when Objectives is clicked', () => {
      render(<SchoolNavItem {...defaultProps} />);
      // First expand the school
      fireEvent.click(screen.getByText('Washington Elementary'));
      mockNavigate.mockClear();
      // Then click Objectives
      fireEvent.click(screen.getByText('Objectives'));
      expect(mockNavigate).toHaveBeenCalledWith('/schools/washington-elementary/admin/objectives');
    });

    it('navigates to /schools/{slug}/admin/users when Users is clicked', () => {
      render(<SchoolNavItem {...defaultProps} />);
      fireEvent.click(screen.getByText('Washington Elementary'));
      mockNavigate.mockClear();
      fireEvent.click(screen.getByText('Users'));
      expect(mockNavigate).toHaveBeenCalledWith('/schools/washington-elementary/admin/users');
    });

    it('navigates to /schools/{slug}/admin/appearance when Appearance is clicked', () => {
      render(<SchoolNavItem {...defaultProps} />);
      fireEvent.click(screen.getByText('Washington Elementary'));
      mockNavigate.mockClear();
      fireEvent.click(screen.getByText('Appearance'));
      expect(mockNavigate).toHaveBeenCalledWith('/schools/washington-elementary/admin/appearance');
    });
  });
});
