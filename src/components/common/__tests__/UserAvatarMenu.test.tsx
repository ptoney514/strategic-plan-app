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

// Mock ThemeContext
const mockSetTheme = vi.fn();
vi.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: mockSetTheme,
    isDark: false,
    toggle: vi.fn(),
  }),
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

    it('renders avatar button', () => {
      renderWithRouter(<UserAvatarMenu />);
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    });

    it('opens dropdown menu when avatar is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      const triggerButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('District Admin')).toBeInTheDocument();
        expect(screen.getByText('Log out')).toBeInTheDocument();
      });
    });

    it('displays user name and role in dropdown header', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('District Admin')).toBeInTheDocument();
      });
    });

    it('shows theme selector options', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
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
        // There should be at least one System Admin text (role label and/or link)
        const systemAdminElements = screen.getAllByText('System Admin');
        expect(systemAdminElements.length).toBeGreaterThanOrEqual(1);
        // Verify the link exists by checking for an anchor element
        const hasLink = systemAdminElements.some(el => el.closest('a'));
        expect(hasLink).toBe(true);
      });
    });

    it('shows System Admin role label for system admins', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isSystemAdmin: true,
      });

      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        // The role label in the header should say "System Admin"
        const roleElements = screen.getAllByText('System Admin');
        expect(roleElements.length).toBeGreaterThanOrEqual(1);
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
        // Get the link by finding the anchor element within the menu
        const menuItems = screen.getAllByText('System Admin');
        const adminLink = menuItems.find(el => el.closest('a'));
        expect(adminLink?.closest('a')).toHaveAttribute('href', 'http://localhost:5173?subdomain=admin');
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

    it('calls logout when Log out is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('Log out')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Log out'));

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('uses email prefix as fallback when display_name is not set', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          user_metadata: {},
        },
        logout: mockLogout,
        isSystemAdmin: false,
      });

      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });
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
        expect(screen.getByText('Log out')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Log out')).not.toBeInTheDocument();
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
        expect(screen.getByText('Log out')).toBeInTheDocument();
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
