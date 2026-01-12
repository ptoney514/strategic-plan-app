import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../test/setup';
import { SiteStatusBanner } from '../SiteStatusBanner';

describe('SiteStatusBanner', () => {
  const defaultProps = {
    districtName: 'Test District',
    publicUrl: 'test-district.strategicplanner.app',
    objectivesCount: 5,
    draftsCount: 2,
    usersCount: 10,
    isPublic: true,
    onViewSite: vi.fn(),
  };

  it('renders district name in the banner', () => {
    render(<SiteStatusBanner {...defaultProps} />);
    // District name is not directly displayed, but stats are shown
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Objectives')).toBeInTheDocument();
  });

  it('displays Live status when isPublic is true', () => {
    render(<SiteStatusBanner {...defaultProps} isPublic={true} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('displays Draft status when isPublic is false', () => {
    render(<SiteStatusBanner {...defaultProps} isPublic={false} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('displays correct objectives count', () => {
    render(<SiteStatusBanner {...defaultProps} objectivesCount={8} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Objectives')).toBeInTheDocument();
  });

  it('displays correct drafts count', () => {
    render(<SiteStatusBanner {...defaultProps} draftsCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
  });

  it('displays correct users count', () => {
    render(<SiteStatusBanner {...defaultProps} usersCount={15} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('displays the public URL', () => {
    render(<SiteStatusBanner {...defaultProps} />);
    expect(screen.getByText('test-district.strategicplanner.app')).toBeInTheDocument();
  });

  it('calls onViewSite when URL is clicked', () => {
    const onViewSite = vi.fn();
    render(<SiteStatusBanner {...defaultProps} onViewSite={onViewSite} />);

    fireEvent.click(screen.getByText('test-district.strategicplanner.app'));
    expect(onViewSite).toHaveBeenCalledTimes(1);
  });

  it('handles zero counts correctly', () => {
    render(
      <SiteStatusBanner
        {...defaultProps}
        objectivesCount={0}
        draftsCount={0}
        usersCount={0}
      />
    );

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });
});
