import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/setup';
import { DashboardHeader } from '../DashboardHeader';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock useAuth
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      email: 'test@example.com',
      user_metadata: {
        display_name: 'Test User',
        role: 'district_admin',
      },
    },
  }),
}));

describe('DashboardHeader', () => {
  it('renders the header with correct z-index class', () => {
    render(<DashboardHeader />);

    // Find the header element
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // Verify z-40 is applied for proper stacking
    expect(header).toHaveClass('z-40');
  });

  it('renders with sticky positioning', () => {
    render(<DashboardHeader />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('renders search input', () => {
    render(<DashboardHeader />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(<DashboardHeader />);

    // Notification button should be present (there are multiple buttons, get all)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders user display name', () => {
    render(<DashboardHeader />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders user role', () => {
    render(<DashboardHeader />);

    expect(screen.getByText('District Admin')).toBeInTheDocument();
  });

  it('renders breadcrumb with page title', () => {
    render(<DashboardHeader />);

    // Default pathname '/' should show 'Home'
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});

describe('DashboardHeader z-index hierarchy', () => {
  it('has z-index 40 to be at same level as sidebar', () => {
    render(<DashboardHeader />);

    const header = screen.getByRole('banner');
    const className = header.className;

    // Verify z-40 is present (not z-30)
    expect(className).toContain('z-40');
    expect(className).not.toContain('z-30');
    expect(className).not.toContain('z-20');
  });
});
