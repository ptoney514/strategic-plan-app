import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2Team } from '../V2Team';

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock team hooks
const mockRemoveMutate = vi.fn();
vi.mock('@/hooks/v2/useTeam', () => ({
  useOrgMembers: () => ({
    data: [
      { id: 'm-1', user_name: 'Alice Admin', user_email: 'alice@test.com', role: 'owner' },
      { id: 'm-2', user_name: 'Bob Editor', user_email: 'bob@test.com', role: 'editor' },
      { id: 'm-3', user_name: null, user_email: 'carol@test.com', role: 'viewer' },
    ],
    isLoading: false,
  }),
  useRemoveMember: () => ({
    mutate: mockRemoveMutate,
  }),
}));

// Mock invitations hooks
vi.mock('@/hooks/useInvitations', () => ({
  useOrgInvitations: () => ({
    data: [
      { id: 'inv-1', email: 'pending@test.com', role: 'editor', created_at: '2025-01-15T00:00:00Z' },
    ],
    isLoading: false,
  }),
  useRevokeInvitation: () => ({
    mutate: vi.fn(),
  }),
  useResendInvitation: () => ({
    mutate: vi.fn(),
  }),
  useSendInvitation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('V2Team', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Team heading', () => {
    render(<V2Team />);

    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('renders the Invite Member button', () => {
    render(<V2Team />);

    expect(screen.getByText('Invite Member')).toBeInTheDocument();
  });

  it('shows member count', () => {
    render(<V2Team />);

    expect(screen.getByText('Members (3)')).toBeInTheDocument();
  });

  it('displays member names and emails', () => {
    render(<V2Team />);

    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Editor')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
    // Carol has no name, so email is shown as primary
    expect(screen.getByText('carol@test.com')).toBeInTheDocument();
  });

  it('displays role badges for members', () => {
    render(<V2Team />);

    expect(screen.getByText('Owner')).toBeInTheDocument();
    // "Editor" appears for both the member badge and the invitation badge
    expect(screen.getAllByText('Editor').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('does not show remove button for owner', () => {
    render(<V2Team />);

    // Owner should not have a remove button
    expect(screen.queryByLabelText(/remove alice admin/i)).not.toBeInTheDocument();
    // Non-owners should have remove buttons
    expect(screen.getByLabelText(/remove bob editor/i)).toBeInTheDocument();
  });

  it('shows pending invitations section', () => {
    render(<V2Team />);

    expect(screen.getByText('Pending Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText('pending@test.com')).toBeInTheDocument();
  });

  it('opens invite modal when Invite Member is clicked', async () => {
    const user = userEvent.setup();
    render(<V2Team />);

    await user.click(screen.getByText('Invite Member'));

    expect(screen.getByRole('dialog', { name: /invite member/i })).toBeInTheDocument();
  });

  it('shows resend and revoke buttons for pending invitations', () => {
    render(<V2Team />);

    expect(screen.getByLabelText(/resend invitation to pending@test.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/revoke invitation for pending@test.com/i)).toBeInTheDocument();
  });

  it('confirms before removing a member', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<V2Team />);

    await user.click(screen.getByLabelText(/remove bob editor/i));

    expect(confirmSpy).toHaveBeenCalledWith('Remove Bob Editor from this district?');
    expect(mockRemoveMutate).toHaveBeenCalledWith('m-2');

    confirmSpy.mockRestore();
  });
});
