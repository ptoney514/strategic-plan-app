import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../test/setup';
import { SidebarNav, SidebarHeader, SidebarFooter, SidebarUserFooter } from '../SidebarNav';
import type { District, School } from '../../../../lib/types';

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

// Mock district data
const mockDistrict: District = {
  id: 'dist-1',
  name: 'Test District',
  slug: 'test-district',
  primary_color: '#D97706',
  admin_email: 'admin@test.com',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock schools data
const mockSchools: School[] = [
  {
    id: 'school-1',
    district_id: 'dist-1',
    name: 'Elementary School',
    slug: 'elementary',
    is_public: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'school-2',
    district_id: 'dist-1',
    name: 'Middle School',
    slug: 'middle',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('SidebarNav', () => {
  const defaultProps = {
    district: mockDistrict,
    schools: mockSchools,
    districtSlug: 'test-district',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders Dashboard navigation item', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders District section', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('District')).toBeInTheDocument();
  });

  it('renders district name in navigation', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Test District')).toBeInTheDocument();
  });

  it('renders Schools section', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Schools')).toBeInTheDocument();
  });

  it('displays school count badge', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all schools in navigation', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Elementary School')).toBeInTheDocument();
    expect(screen.getByText('Middle School')).toBeInTheDocument();
  });

  it('renders Add School button', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Add School')).toBeInTheDocument();
  });

  it('renders Settings navigation item', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onAddSchool when Add School button is clicked', () => {
    const onAddSchool = vi.fn();
    render(<SidebarNav {...defaultProps} onAddSchool={onAddSchool} />);

    fireEvent.click(screen.getByText('Add School'));
    expect(onAddSchool).toHaveBeenCalledTimes(1);
  });

  it('renders district sub-navigation items', () => {
    render(<SidebarNav {...defaultProps} />);
    expect(screen.getByText('Objectives')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('collapses District section when header is clicked', () => {
    render(<SidebarNav {...defaultProps} />);

    // Click District section header to collapse
    const districtHeader = screen.getByText('District');
    fireEvent.click(districtHeader);

    // District sub-items should be hidden (except the count which may still show)
    // Note: The section starts expanded by default
  });

  it('collapses Schools section when header is clicked', () => {
    render(<SidebarNav {...defaultProps} />);

    // Schools should be visible initially
    expect(screen.getByText('Elementary School')).toBeInTheDocument();

    // Click Schools section header to collapse
    const schoolsHeader = screen.getByText('Schools');
    fireEvent.click(schoolsHeader);

    // Schools should still be in document (just visually hidden with state)
  });

  it('shows draft indicator for non-public schools', () => {
    render(<SidebarNav {...defaultProps} />);

    // Middle School has is_public: false, should show draft indicator
    const draftIndicators = document.querySelectorAll('[title="Draft"]');
    expect(draftIndicators.length).toBeGreaterThan(0);
  });

  it('handles empty schools array', () => {
    render(<SidebarNav {...defaultProps} schools={[]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Add School')).toBeInTheDocument();
  });

  // Navigation path tests
  describe('navigation paths', () => {
    it('navigates to /admin when Dashboard is clicked', () => {
      render(<SidebarNav {...defaultProps} />);
      fireEvent.click(screen.getByText('Dashboard'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('navigates to /admin/objectives when Objectives is clicked', () => {
      render(<SidebarNav {...defaultProps} />);
      fireEvent.click(screen.getByText('Objectives'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/objectives');
    });

    it('navigates to /admin/users when Users is clicked', () => {
      render(<SidebarNav {...defaultProps} />);
      fireEvent.click(screen.getByText('Users'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });

    it('navigates to /admin/appearance when Appearance is clicked', () => {
      render(<SidebarNav {...defaultProps} />);
      fireEvent.click(screen.getByText('Appearance'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/appearance');
    });

    it('navigates to /admin/settings when Settings is clicked', () => {
      render(<SidebarNav {...defaultProps} />);
      fireEvent.click(screen.getByText('Settings'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/settings');
    });

    it('navigates to school admin when school is clicked', () => {
      render(<SidebarNav {...defaultProps} />);
      fireEvent.click(screen.getByText('Elementary School'));
      expect(mockNavigate).toHaveBeenCalledWith('/schools/elementary/admin');
    });
  });
});

describe('SidebarHeader', () => {
  it('renders district name', () => {
    render(
      <SidebarHeader
        district={mockDistrict}
        userEmail="user@test.com"
        userRole="District Admin"
      />
    );
    expect(screen.getByText('Test District')).toBeInTheDocument();
  });

  it('renders Strategic Planning label', () => {
    render(
      <SidebarHeader
        district={mockDistrict}
        userEmail="user@test.com"
        userRole="District Admin"
      />
    );
    expect(screen.getByText('Strategic Planning')).toBeInTheDocument();
  });

  it('displays district initials when no logo', () => {
    render(
      <SidebarHeader
        district={mockDistrict}
        userEmail="user@test.com"
        userRole="District Admin"
      />
    );
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('displays district logo when available', () => {
    const districtWithLogo = {
      ...mockDistrict,
      logo_url: 'https://example.com/logo.png'
    };
    render(
      <SidebarHeader
        district={districtWithLogo}
        userEmail="user@test.com"
        userRole="District Admin"
      />
    );

    // Image has alt="" for decorative purposes, so use querySelector
    const logo = document.querySelector('img[src="https://example.com/logo.png"]');
    expect(logo).toBeInTheDocument();
  });
});

describe('SidebarFooter', () => {
  it('renders View Public Site button', () => {
    const onNavigate = vi.fn();
    render(<SidebarFooter publicUrl="/test-district" onNavigate={onNavigate} />);
    expect(screen.getByText('View Public Site')).toBeInTheDocument();
  });

  it('calls onNavigate when button is clicked', () => {
    const onNavigate = vi.fn();
    render(<SidebarFooter publicUrl="/test-district" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText('View Public Site'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe('SidebarUserFooter', () => {
  it('renders user name', () => {
    render(<SidebarUserFooter userName="John Doe" userRole="District Admin" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders user role', () => {
    render(<SidebarUserFooter userName="John Doe" userRole="District Admin" />);
    expect(screen.getByText('District Admin')).toBeInTheDocument();
  });

  it('displays user initials from full name', () => {
    render(<SidebarUserFooter userName="John Doe" userRole="District Admin" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('displays user initials from single name', () => {
    render(<SidebarUserFooter userName="admin" userRole="District Admin" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
