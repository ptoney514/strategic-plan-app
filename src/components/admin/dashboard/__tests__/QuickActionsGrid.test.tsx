import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../test/setup';
import { QuickActionsGrid } from '../QuickActionsGrid';

describe('QuickActionsGrid', () => {
  const defaultProps = {
    onAddObjective: vi.fn(),
    onInviteUser: vi.fn(),
    onCustomize: vi.fn(),
    onPreviewSite: vi.fn(),
  };

  it('renders all four action cards', () => {
    render(<QuickActionsGrid {...defaultProps} />);

    expect(screen.getByText('Add Objective')).toBeInTheDocument();
    expect(screen.getByText('Invite User')).toBeInTheDocument();
    expect(screen.getByText('Customize')).toBeInTheDocument();
    expect(screen.getByText('Preview Site')).toBeInTheDocument();
  });

  it('renders action descriptions', () => {
    render(<QuickActionsGrid {...defaultProps} />);

    expect(screen.getByText('Create a new strategic objective')).toBeInTheDocument();
    expect(screen.getByText('Add team members to collaborate')).toBeInTheDocument();
    expect(screen.getByText('Update branding and appearance')).toBeInTheDocument();
    expect(screen.getByText('See your public strategic plan')).toBeInTheDocument();
  });

  it('calls onAddObjective when Add Objective is clicked', () => {
    const onAddObjective = vi.fn();
    render(<QuickActionsGrid {...defaultProps} onAddObjective={onAddObjective} />);

    fireEvent.click(screen.getByText('Add Objective'));
    expect(onAddObjective).toHaveBeenCalledTimes(1);
  });

  it('calls onInviteUser when Invite User is clicked', () => {
    const onInviteUser = vi.fn();
    render(<QuickActionsGrid {...defaultProps} onInviteUser={onInviteUser} />);

    fireEvent.click(screen.getByText('Invite User'));
    expect(onInviteUser).toHaveBeenCalledTimes(1);
  });

  it('calls onCustomize when Customize is clicked', () => {
    const onCustomize = vi.fn();
    render(<QuickActionsGrid {...defaultProps} onCustomize={onCustomize} />);

    fireEvent.click(screen.getByText('Customize'));
    expect(onCustomize).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviewSite when Preview Site is clicked', () => {
    const onPreviewSite = vi.fn();
    render(<QuickActionsGrid {...defaultProps} onPreviewSite={onPreviewSite} />);

    fireEvent.click(screen.getByText('Preview Site'));
    expect(onPreviewSite).toHaveBeenCalledTimes(1);
  });

  it('renders cards as buttons', () => {
    render(<QuickActionsGrid {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
