import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/setup';
import userEvent from '@testing-library/user-event';
import { ResetPassword } from '../ResetPassword';

// Mock the auth client
const mockResetPassword = vi.fn();
vi.mock('../../lib/auth-client', () => ({
  authClient: {
    resetPassword: (...args: unknown[]) => mockResetPassword(...args),
  },
}));

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassword.mockResolvedValue({ error: null });
  });

  describe('without token', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '' },
        writable: true,
      });
    });

    it('shows invalid link error when no token in URL', () => {
      render(<ResetPassword />);
      expect(screen.getByText('Invalid or missing reset link')).toBeInTheDocument();
    });

    it('shows a link to request a new reset', () => {
      render(<ResetPassword />);
      const link = screen.getByText(/request a new reset link/i);
      expect(link.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    it('shows a link back to login', () => {
      render(<ResetPassword />);
      const link = screen.getByText(/back to login/i);
      expect(link.closest('a')).toHaveAttribute('href', '/login');
    });

    it('does not render the password form', () => {
      render(<ResetPassword />);
      expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    });
  });

  describe('with token', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '?token=test-reset-token-123' },
        writable: true,
      });
    });

    it('renders password fields when token is present', () => {
      render(<ResetPassword />);
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders the heading "Set new password"', () => {
      render(<ResetPassword />);
      expect(screen.getByText('Set new password')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<ResetPassword />);
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('shows validation error for short password', async () => {
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.type(screen.getByLabelText(/confirm password/i), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('shows validation error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'different123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('does not call resetPassword when validation fails', async () => {
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'short');
      await user.type(screen.getByLabelText(/confirm password/i), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it('calls resetPassword with token and new password on valid submit', async () => {
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
      await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith({
          newPassword: 'newpassword123',
          token: 'test-reset-token-123',
        });
      });
    });

    it('shows success message after successful reset', async () => {
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
      await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/password has been reset successfully/i)).toBeInTheDocument();
      });
    });

    it('shows login link after successful reset', async () => {
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
      await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        const loginLink = screen.getByText(/back to login/i);
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
      });
    });

    it('shows error for expired/invalid token from API', async () => {
      mockResetPassword.mockResolvedValue({ error: { message: 'Invalid token' } });
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
      await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/expired or is invalid/i)).toBeInTheDocument();
      });
    });

    it('shows error when resetPassword throws an exception', async () => {
      mockResetPassword.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
      await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/expired or is invalid/i)).toBeInTheDocument();
      });
    });

    it('shows link to request new reset on error', async () => {
      mockResetPassword.mockResolvedValue({ error: { message: 'Invalid token' } });
      const user = userEvent.setup();
      render(<ResetPassword />);

      await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
      await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        const link = screen.getByText(/request a new reset link/i);
        expect(link.closest('a')).toHaveAttribute('href', '/forgot-password');
      });
    });

    it('submit button has full-width class', () => {
      render(<ResetPassword />);
      const button = screen.getByRole('button', { name: /reset password/i });
      expect(button).toHaveClass('w-full');
    });

    it('renders branding panel with responsive classes', () => {
      render(<ResetPassword />);
      const brandingPanel = screen.getByText('StrataDash', { selector: 'h1' }).closest('div.relative.hidden');
      expect(brandingPanel).toHaveClass('lg:block');
    });
  });
});
