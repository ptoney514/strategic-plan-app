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

// Wrapper component with Router
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('UserAvatarMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockResolvedValue(undefined);
  });

  describe('when user is not authenticated', () => {
    it('renders nothing when no user', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
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
        expect(screen.getByText('My Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
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

    it('shows Admin link for all authenticated users', async () => {
      const user = userEvent.setup();
      renderWithRouter(<UserAvatarMenu />);

      await user.click(screen.getByRole('button', { name: /user menu/i }));

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
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
      });
    });

    it('applies custom className to trigger button', () => {
      renderWithRouter(<UserAvatarMenu className="custom-trigger-class" />);
      const button = screen.getByRole('button', { name: /user menu/i });
      expect(button).toHaveClass('custom-trigger-class');
    });
  });
});
