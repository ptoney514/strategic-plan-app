import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserAvatarMenu } from '../UserAvatarMenu';

// Mock the AuthContext
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock SubdomainContext - default to root subdomain
vi.mock('../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ type: 'root', slug: null }),
}));

// Mock subdomain utility
vi.mock('../../../lib/subdomain', () => ({
  buildSubdomainUrlWithPath: (type: string, path?: string, slug?: string) => {
    if (type === 'admin') return 'http://localhost:5173?subdomain=admin';
    if (type === 'district' && slug) return `http://localhost:5173?subdomain=${slug}${path || ''}`;
    return 'http://localhost:5173';
  },
  getSubdomainUrl: (type: string) => {
    if (type === 'root') return 'http://localhost:5173';
    if (type === 'admin') return 'http://localhost:5173?subdomain=admin';
    return 'http://localhost:5173';
  },
}));

// Mock Supabase - default returns empty districts
const mockSupabaseResponse = vi.fn().mockResolvedValue({ data: [], error: null });
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => mockSupabaseResponse(),
      }),
    }),
  },
}));

// Wrapper component with Router
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('UserAvatarMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
    mockSupabaseResponse.mockResolvedValue({ data: [], error: null });
  });

  describe('when user is not authenticated', () => {
    it('renders nothing when no user', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
        isSystemAdmin: false,
      });

      const { container } = renderWithRouter(<UserAvatarMenu />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser = {
      id: 'user-123',
      email: 'john.doe@example.com',
      user_metadata: {
        display_name: 'John Doe',
      },
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isSystemAdmin: false,
      });
    });

    it('renders avatar button with user initials', () => {
      renderWithRouter(<UserAvatarMenu />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows username on desktop when showName is true', () => {
      renderWithRouter(<UserAvatarMenu showName={true} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('opens dropdown menu when avatar is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      const triggerButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });
    });

    it('displays user email in dropdown', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });
    });

    it('shows System Admin link for system admins', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isSystemAdmin: true,
      });

      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('System Admin')).toBeInTheDocument();
      });
    });

    it('System Admin link uses subdomain-aware URL', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isSystemAdmin: true,
      });

      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        const adminLink = screen.getByText('System Admin').closest('a');
        expect(adminLink).toHaveAttribute('href', 'http://localhost:5173?subdomain=admin');
      });
    });

    it('shows district admin links when user has district access', async () => {
      mockSupabaseResponse.mockResolvedValue({
        data: [
          {
            district_slug: 'westside',
            spb_districts: { name: 'Westside District' },
          },
        ],
        error: null,
      });

      mockUseAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isSystemAdmin: false,
      });

      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('Westside District')).toBeInTheDocument();
      });

      // Verify the link uses subdomain-aware URL
      const districtLink = screen.getByText('Westside District').closest('a');
      expect(districtLink).toHaveAttribute(
        'href',
        'http://localhost:5173?subdomain=westside/admin'
      );
    });

    it('calls logout when Sign Out is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('uses email prefix as fallback when display_name is not set', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          user_metadata: {},
        },
        logout: mockLogout,
        isSystemAdmin: false,
      });

      renderWithRouter(<UserAvatarMenu />);
      expect(screen.getByText('AD')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { display_name: 'Test User' },
        },
        logout: mockLogout,
        isSystemAdmin: false,
      });
    });

    it('has accessible button with aria-label', () => {
      renderWithRouter(<UserAvatarMenu />);
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    });

    it('closes menu on Escape key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      // Open menu
      await user.click(screen.getByRole('button', { name: /user menu/i }));
      await waitFor(() => {
        expect(screen.getByText('My Profile')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      // Focus and open with Enter
      const button = screen.getByRole('button', { name: /user menu/i });
      button.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('My Profile')).toBeInTheDocument();
      });
    });
  });

  describe('custom className', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { display_name: 'Test' },
        },
        logout: mockLogout,
        isSystemAdmin: false,
      });
    });

    it('applies custom className to trigger button', () => {
      renderWithRouter(<UserAvatarMenu className="custom-trigger-class" />);
      const button = screen.getByRole('button', { name: /user menu/i });
      expect(button).toHaveClass('custom-trigger-class');
    });
  });
});
