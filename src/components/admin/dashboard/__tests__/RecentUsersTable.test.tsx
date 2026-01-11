import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecentUsersTable } from '../RecentUsersTable';
import type { UserWithRole } from '../../../../lib/services/systemAdmin.service';

const mockUsers: UserWithRole[] = [
  {
    id: '1',
    user_id: 'user-uuid-1234-5678-abcd',
    role: 'district_admin',
    district_name: 'Westside Schools',
    district_slug: 'westside',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-uuid-abcd-efgh-ijkl',
    role: 'school_admin',
    school_name: 'Lincoln Elementary',
    district_slug: 'westside',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RecentUsersTable', () => {
  it('renders the table header', () => {
    renderWithRouter(<RecentUsersTable users={mockUsers} />);

    expect(screen.getByText('Recent Users')).toBeInTheDocument();
    expect(screen.getByText('View all users')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    renderWithRouter(<RecentUsersTable users={mockUsers} />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('District / School')).toBeInTheDocument();
    expect(screen.getByText('Added')).toBeInTheDocument();
  });

  it('renders user rows with correct data', () => {
    renderWithRouter(<RecentUsersTable users={mockUsers} />);

    // Check truncated user IDs are displayed (both users have truncated IDs starting with same prefix)
    const userIdElements = screen.getAllByText(/user-uui/);
    expect(userIdElements).toHaveLength(2);

    // Check district/school names
    expect(screen.getByText('Westside Schools')).toBeInTheDocument();
    expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
  });

  it('renders role badges correctly', () => {
    renderWithRouter(<RecentUsersTable users={mockUsers} />);

    expect(screen.getByText('District Admin')).toBeInTheDocument();
    expect(screen.getByText('School Admin')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    renderWithRouter(<RecentUsersTable users={[]} />);

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    renderWithRouter(<RecentUsersTable users={[]} isLoading={true} />);

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders "View all users" link with correct href', () => {
    renderWithRouter(<RecentUsersTable users={mockUsers} />);

    const link = screen.getByText('View all users');
    expect(link.closest('a')).toHaveAttribute('href', '/users');
  });

  it('displays relative time for user creation', () => {
    renderWithRouter(<RecentUsersTable users={mockUsers} />);

    // The first user was created "just now" or "minutes ago"
    // The second user was created "1 day ago"
    expect(screen.getByText(/day ago|days ago/i)).toBeInTheDocument();
  });
});
