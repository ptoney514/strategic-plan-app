import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2Appearance } from '../V2Appearance';
import { toast } from '@/components/Toast';

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock district hooks
const mockMutateAsync = vi.fn().mockResolvedValue({});
const mockDistrictData = {
  id: 'district-1',
  name: 'Test District',
  slug: 'test-org',
  primary_color: '#0099CC',
  secondary_color: '#FFB800',
  logo_url: '',
  dashboard_template: 'hierarchical' as const,
  dashboard_config: {},
  tagline: 'Learn and grow',
  is_public: true,
  admin_email: 'admin@test.com',
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

let mockIsLoading = false;
vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: mockIsLoading ? undefined : mockDistrictData,
    isLoading: mockIsLoading,
  }),
  useUpdateDistrict: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

// Mock toast
vi.mock('@/components/Toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock LogoUpload component
vi.mock('@/components/v2/LogoUpload', () => ({
  LogoUpload: () => <div data-testid="logo-upload">Logo Upload</div>,
}));

// Mock TemplateRegistry to avoid import errors from useAppearanceState
vi.mock('@/components/public/templates/TemplateRegistry', () => ({
  getMergedConfig: () => ({}),
}));

describe('V2Appearance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
  });

  it('renders Appearance heading', () => {
    render(<V2Appearance />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('renders color pickers with district colors', () => {
    render(<V2Appearance />);
    expect(screen.getByText('Primary Color')).toBeInTheDocument();
    expect(screen.getByText('Secondary Color')).toBeInTheDocument();
  });

  it('renders logo section', () => {
    render(<V2Appearance />);
    expect(screen.getByTestId('logo-upload')).toBeInTheDocument();
  });

  it('renders template selector', () => {
    render(<V2Appearance />);
    expect(screen.getByText('Hierarchical')).toBeInTheDocument();
    expect(screen.getByText('Launch Traction')).toBeInTheDocument();
  });

  it('renders tagline input with district value', () => {
    render(<V2Appearance />);
    const taglineInput = screen.getByTestId('tagline-input');
    expect(taglineInput).toHaveValue('Learn and grow');
  });

  it('renders public visibility toggle', () => {
    render(<V2Appearance />);
    const toggle = screen.getByTestId('public-toggle');
    expect(toggle).toBeChecked();
    expect(screen.getByText('Make dashboard publicly accessible')).toBeInTheDocument();
  });

  it('save button is disabled when not dirty', () => {
    render(<V2Appearance />);
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
  });

  it('save calls mutation with correct payload', async () => {
    const user = userEvent.setup();
    render(<V2Appearance />);

    // Make a change to enable save
    const taglineInput = screen.getByTestId('tagline-input');
    await user.clear(taglineInput);
    await user.type(taglineInput, 'New tagline');

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).not.toBeDisabled();
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'district-1',
        updates: expect.objectContaining({
          primary_color: '#0099CC',
          secondary_color: '#FFB800',
          dashboard_template: 'hierarchical',
          tagline: 'New tagline',
        }),
      });
    });
  });

  it('discard resets form', async () => {
    const user = userEvent.setup();
    render(<V2Appearance />);

    // Make a change
    const taglineInput = screen.getByTestId('tagline-input');
    await user.clear(taglineInput);
    await user.type(taglineInput, 'Changed');

    // Click discard
    const discardButton = screen.getByText('Discard');
    await user.click(discardButton);

    expect(screen.getByTestId('tagline-input')).toHaveValue('Learn and grow');
  });

  it('shows loading state when district is loading', () => {
    mockIsLoading = true;
    render(<V2Appearance />);
    expect(screen.getByTestId('appearance-loading')).toBeInTheDocument();
  });

  it('shows toast.error on save failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));
    const user = userEvent.setup();
    render(<V2Appearance />);

    // Make a change to enable save
    const taglineInput = screen.getByTestId('tagline-input');
    await user.clear(taglineInput);
    await user.type(taglineInput, 'Fail test');

    await user.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save appearance');
    });
  });

  it('tagline change marks form as dirty', async () => {
    const user = userEvent.setup();
    render(<V2Appearance />);

    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();

    const taglineInput = screen.getByTestId('tagline-input');
    await user.type(taglineInput, '!');

    expect(saveButton).not.toBeDisabled();
  });
});
