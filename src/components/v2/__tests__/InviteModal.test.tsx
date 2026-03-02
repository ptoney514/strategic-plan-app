import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { InviteModal } from '../InviteModal';

// Mock the invitation hook
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/useInvitations', () => ({
  useSendInvitation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('InviteModal', () => {
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    slug: 'test-org',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  it('renders when isOpen is true', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByRole('dialog', { name: /invite member/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<InviteModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Invite Member heading', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByText('Invite Member')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('colleague@school.edu')).toBeInTheDocument();
  });

  it('renders role options', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('renders role descriptions', () => {
    render(<InviteModal {...defaultProps} />);

    expect(screen.getByText('Full access to manage district')).toBeInTheDocument();
    expect(screen.getByText('Can edit plans and goals')).toBeInTheDocument();
    expect(screen.getByText('Read-only access')).toBeInTheDocument();
  });

  it('defaults to editor role', () => {
    render(<InviteModal {...defaultProps} />);

    const editorRadio = screen.getByDisplayValue('editor');
    expect(editorRadio).toBeChecked();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<InviteModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits invitation with email and role', async () => {
    const user = userEvent.setup();
    render(<InviteModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/email address/i), 'new@test.com');
    await user.click(screen.getByDisplayValue('admin'));
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'new@test.com',
      role: 'admin',
    });
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<InviteModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close (X) button is clicked', async () => {
    const user = userEvent.setup();
    render(<InviteModal {...defaultProps} />);

    await user.click(screen.getByLabelText(/close/i));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message when invitation fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('User already invited'));
    const user = userEvent.setup();
    render(<InviteModal {...defaultProps} />);

    await user.type(screen.getByLabelText(/email address/i), 'existing@test.com');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(await screen.findByText('User already invited')).toBeInTheDocument();
  });
});
