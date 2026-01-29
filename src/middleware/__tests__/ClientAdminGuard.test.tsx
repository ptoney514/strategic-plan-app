import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ClientAdminGuard } from '../ClientAdminGuard';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderWithRouter(
  component: React.ReactElement,
  { initialEntries = ['/westside/admin'] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/:slug/admin/*" element={component} />
        <Route path="/:slug" element={<div>Public View</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ClientAdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while checking auth', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      hasDistrictAccess: vi.fn(),
    });

    renderWithRouter(
      <ClientAdminGuard>
        <div>Protected Content</div>
      </ClientAdminGuard>
    );

    expect(screen.getByText('Verifying access...')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    const mockHasDistrictAccess = vi.fn().mockResolvedValue(false);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      hasDistrictAccess: mockHasDistrictAccess,
    });

    renderWithRouter(
      <ClientAdminGuard>
        <div>Protected Content</div>
      </ClientAdminGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('redirects to public view when no admin access', async () => {
    const mockHasDistrictAccess = vi.fn().mockResolvedValue(false);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      hasDistrictAccess: mockHasDistrictAccess,
    });

    renderWithRouter(
      <ClientAdminGuard>
        <div>Protected Content</div>
      </ClientAdminGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Public View')).toBeInTheDocument();
    });
  });

  it('renders protected content when user has district access', async () => {
    const mockHasDistrictAccess = vi.fn().mockResolvedValue(true);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      hasDistrictAccess: mockHasDistrictAccess,
    });

    renderWithRouter(
      <ClientAdminGuard>
        <div>Protected Content</div>
      </ClientAdminGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('calls hasDistrictAccess with correct slug from URL params', async () => {
    const mockHasDistrictAccess = vi.fn().mockResolvedValue(true);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      hasDistrictAccess: mockHasDistrictAccess,
    });

    renderWithRouter(
      <ClientAdminGuard>
        <div>Protected Content</div>
      </ClientAdminGuard>,
      { initialEntries: ['/eastside/admin'] }
    );

    await waitFor(() => {
      expect(mockHasDistrictAccess).toHaveBeenCalledWith('eastside');
    });
  });

  it('uses districtSlug prop over URL param when provided', async () => {
    const mockHasDistrictAccess = vi.fn().mockResolvedValue(true);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      hasDistrictAccess: mockHasDistrictAccess,
    });

    renderWithRouter(
      <ClientAdminGuard districtSlug="northside">
        <div>Protected Content</div>
      </ClientAdminGuard>,
      { initialEntries: ['/westside/admin'] }
    );

    await waitFor(() => {
      // Should use prop 'northside', not URL param 'westside'
      expect(mockHasDistrictAccess).toHaveBeenCalledWith('northside');
    });
  });

  it('handles access check errors gracefully', async () => {
    const mockHasDistrictAccess = vi.fn().mockRejectedValue(new Error('Network error'));
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      hasDistrictAccess: mockHasDistrictAccess,
    });

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(
      <ClientAdminGuard>
        <div>Protected Content</div>
      </ClientAdminGuard>
    );

    await waitFor(() => {
      // Should redirect to public view on error
      expect(screen.getByText('Public View')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
