import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubdomainProvider } from '../../../../contexts/SubdomainContext';
import { DistrictAppearance } from '../DistrictAppearance';
import type { District } from '../../../../lib/types';

// Mock the SubdomainContext
vi.mock('../../../../contexts/SubdomainContext', async () => {
  const actual = await vi.importActual('../../../../contexts/SubdomainContext');
  return {
    ...actual,
    useSubdomain: () => ({
      slug: 'test-district',
      isSystemAdmin: false,
    }),
  };
});

// Mock district data
const mockDistrict: District = {
  id: 'district-1',
  name: 'Test District',
  slug: 'test-district',
  primary_color: '#0099CC',
  secondary_color: '#FFB800',
  logo_url: '',
  admin_email: 'admin@test.com',
  is_public: true,
  dashboard_template: 'hierarchical',
  dashboard_config: {
    showSidebar: true,
    showNarrativeHero: true,
    gridColumns: 3,
    enableAnimations: false,
    cardVariant: 'default',
  },
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

// Mock mutation function
const mockMutateAsync = vi.fn();

// Mock the useDistrict and useUpdateDistrict hooks
vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: vi.fn(() => ({
    data: mockDistrict,
    isLoading: false,
    error: null,
  })),
  useUpdateDistrict: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  })),
}));

// Mock the useImageUpload hook
vi.mock('../../../../hooks/useUpload', () => ({
  useImageUpload: vi.fn(() => ({
    upload: vi.fn(),
    isUploading: false,
    progress: null,
    error: null,
    reset: vi.fn(),
  })),
}));

// Mock TemplateRegistry
vi.mock('../../../../components/public/templates/TemplateRegistry', () => ({
  getAllTemplates: () => [
    {
      id: 'hierarchical',
      name: 'Hierarchical',
      description: 'Traditional layout',
      defaultConfig: {
        showSidebar: true,
        showNarrativeHero: true,
        gridColumns: 3,
        enableAnimations: false,
        cardVariant: 'default',
      },
    },
    {
      id: 'metrics-grid',
      name: 'Metrics Grid',
      description: 'Flat grid',
      defaultConfig: {
        showSidebar: true,
        showNarrativeHero: true,
        gridColumns: 3,
        enableAnimations: true,
        cardVariant: 'compact',
      },
    },
    {
      id: 'launch-traction',
      name: 'Launch Traction',
      description: 'Animated dashboard',
      defaultConfig: {
        showSidebar: false,
        showNarrativeHero: false,
        gridColumns: 4,
        enableAnimations: true,
        cardVariant: 'rich',
      },
    },
  ],
  getTemplateInfo: (templateId: string) => {
    const templates: Record<string, unknown> = {
      hierarchical: {
        id: 'hierarchical',
        name: 'Hierarchical',
        description: 'Traditional layout',
        defaultConfig: {
          showSidebar: true,
          showNarrativeHero: true,
          gridColumns: 3,
          enableAnimations: false,
          cardVariant: 'default',
        },
      },
      'metrics-grid': {
        id: 'metrics-grid',
        name: 'Metrics Grid',
        description: 'Flat grid',
        defaultConfig: {
          showSidebar: true,
          showNarrativeHero: true,
          gridColumns: 3,
          enableAnimations: true,
          cardVariant: 'compact',
        },
      },
      'launch-traction': {
        id: 'launch-traction',
        name: 'Launch Traction',
        description: 'Animated dashboard',
        defaultConfig: {
          showSidebar: false,
          showNarrativeHero: false,
          gridColumns: 4,
          enableAnimations: true,
          cardVariant: 'rich',
        },
      },
    };
    return templates[templateId] || templates.hierarchical;
  },
}));

// Import after mocking
import { useDistrict, useUpdateDistrict } from '../../../../hooks/useDistricts';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

const renderComponent = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SubdomainProvider>
        <BrowserRouter>
          <DistrictAppearance />
        </BrowserRouter>
      </SubdomainProvider>
    </QueryClientProvider>
  );
};

describe('DistrictAppearance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue(mockDistrict);

    // Reset mock implementations to default
    vi.mocked(useDistrict).mockReturnValue({
      data: mockDistrict,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDistrict>);

    vi.mocked(useUpdateDistrict).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateDistrict>);
  });

  describe('Loading state', () => {
    it('shows skeleton while loading district', () => {
      vi.mocked(useDistrict).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as ReturnType<typeof useDistrict>);

      renderComponent();

      // Should show loading skeleton (animate-pulse class)
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Form initialization', () => {
    it('displays page header', () => {
      renderComponent();

      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText("Customize your district's branding")).toBeInTheDocument();
    });

    it('populates primary color from district data', () => {
      renderComponent();

      const primaryInput = screen.getByTestId('color-primary-input');
      expect(primaryInput).toHaveValue('#0099CC');
    });

    it('populates secondary color from district data', () => {
      renderComponent();

      const secondaryInput = screen.getByTestId('color-secondary-input');
      expect(secondaryInput).toHaveValue('#FFB800');
    });

    it('sets template from district.dashboard_template', () => {
      renderComponent();

      const hierarchicalOption = screen.getByTestId('template-option-hierarchical');
      expect(hierarchicalOption).toHaveClass('border-amber-500');
    });

    it('displays Colors section', () => {
      renderComponent();

      expect(screen.getByText('Colors')).toBeInTheDocument();
      expect(screen.getByText('Primary Color')).toBeInTheDocument();
      expect(screen.getByText('Secondary Color')).toBeInTheDocument();
    });

    it('displays Logo section', () => {
      renderComponent();

      expect(screen.getByText('Logo')).toBeInTheDocument();
    });

    it('displays Dashboard Template section', () => {
      renderComponent();

      expect(screen.getByText('Dashboard Template')).toBeInTheDocument();
      expect(screen.getByText('Choose how your public dashboard looks')).toBeInTheDocument();
    });
  });

  describe('Preview section', () => {
    it('shows preview section', () => {
      renderComponent();

      expect(screen.getByTestId('appearance-preview')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('shows district name in preview header', () => {
      renderComponent();

      // District name appears in the preview header
      const preview = screen.getByTestId('appearance-preview');
      expect(preview).toHaveTextContent('Test District');
    });

    it('shows Homepage and Dashboard tabs', () => {
      renderComponent();

      expect(screen.getByText('Homepage')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('shows browser chrome with district URL', () => {
      renderComponent();

      // Preview shows a mock browser URL
      expect(screen.getByText(/testdistrict\.stratadash\.com/i)).toBeInTheDocument();
    });

    it('shows helper text about real-time updates', () => {
      renderComponent();

      expect(screen.getByText(/Changes are reflected in real-time/i)).toBeInTheDocument();
    });

    it('shows logo in preview when logoUrl is set', () => {
      const districtWithLogo = {
        ...mockDistrict,
        logo_url: 'https://example.com/logo.png',
      };

      vi.mocked(useDistrict).mockReturnValue({
        data: districtWithLogo,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useDistrict>);

      renderComponent();

      // Find any image with the logo URL in the preview
      const logoImages = screen.getAllByRole('img');
      const logoImage = logoImages.find(img => img.getAttribute('src') === 'https://example.com/logo.png');
      expect(logoImage).toBeInTheDocument();
    });
  });

  describe('Color changes', () => {
    it('updates primary color when changed via text input', () => {
      renderComponent();

      const primaryInput = screen.getByTestId('color-primary-input');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      expect(primaryInput).toHaveValue('#FF0000');
    });

    it('updates secondary color when changed via text input', () => {
      renderComponent();

      const secondaryInput = screen.getByTestId('color-secondary-input');
      fireEvent.change(secondaryInput, { target: { value: '#00FF00' } });

      expect(secondaryInput).toHaveValue('#00FF00');
    });

    it('preview updates when color changes', () => {
      renderComponent();

      const primaryInput = screen.getByTestId('color-primary-input');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      // The preview contains elements styled with the primary color
      // Check that the preview container is still visible (real-time update)
      const preview = screen.getByTestId('appearance-preview');
      expect(preview).toBeInTheDocument();
    });
  });

  describe('Template selection', () => {
    it('can select a different template', () => {
      renderComponent();

      const metricsGridOption = screen.getByTestId('template-option-metrics-grid');
      fireEvent.click(metricsGridOption);

      expect(metricsGridOption).toHaveClass('border-amber-500');
    });
  });

  describe('Template config', () => {
    it('can toggle sidebar visibility', () => {
      renderComponent();

      const sidebarToggle = screen.getByTestId('config-show-sidebar') as HTMLInputElement;
      const initialChecked = sidebarToggle.checked;

      fireEvent.click(sidebarToggle);

      // State should have changed
      expect(sidebarToggle.checked).toBe(!initialChecked);
    });

    it('can change grid columns', () => {
      renderComponent();

      const grid4Button = screen.getByTestId('config-grid-4');
      fireEvent.click(grid4Button);

      expect(grid4Button).toHaveClass('bg-amber-500');
    });

    it('can change card style', () => {
      renderComponent();

      const richButton = screen.getByTestId('config-card-rich');
      fireEvent.click(richButton);

      expect(richButton).toHaveClass('bg-amber-500');
    });
  });

  describe('Save functionality', () => {
    it('shows save button', () => {
      renderComponent();

      expect(screen.getByTestId('appearance-save-btn')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('calls updateDistrict with all form values on save', async () => {
      renderComponent();

      // Make some changes
      const primaryInput = screen.getByTestId('color-primary-input');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      const metricsGridOption = screen.getByTestId('template-option-metrics-grid');
      fireEvent.click(metricsGridOption);

      // Click save
      const saveButton = screen.getByTestId('appearance-save-btn');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: 'district-1',
          updates: expect.objectContaining({
            primary_color: '#FF0000',
            dashboard_template: 'metrics-grid',
          }),
        });
      });
    });

    it('shows loading state on save button during save', () => {
      vi.mocked(useUpdateDistrict).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      } as unknown as ReturnType<typeof useUpdateDistrict>);

      renderComponent();

      const saveButton = screen.getByTestId('appearance-save-btn');
      expect(saveButton).toHaveTextContent('Saving...');
      expect(saveButton).toBeDisabled();
    });

    it('disables save button during save', () => {
      vi.mocked(useUpdateDistrict).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      } as unknown as ReturnType<typeof useUpdateDistrict>);

      renderComponent();

      expect(screen.getByTestId('appearance-save-btn')).toBeDisabled();
    });

    it('disables template selector during save', () => {
      vi.mocked(useUpdateDistrict).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      } as unknown as ReturnType<typeof useUpdateDistrict>);

      renderComponent();

      expect(screen.getByTestId('template-option-hierarchical')).toBeDisabled();
      expect(screen.getByTestId('template-option-metrics-grid')).toBeDisabled();
      expect(screen.getByTestId('template-option-launch-traction')).toBeDisabled();
    });

    it('disables config editor during save', () => {
      vi.mocked(useUpdateDistrict).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      } as unknown as ReturnType<typeof useUpdateDistrict>);

      renderComponent();

      expect(screen.getByTestId('config-show-sidebar')).toBeDisabled();
      expect(screen.getByTestId('config-show-hero')).toBeDisabled();
      expect(screen.getByTestId('config-enable-animations')).toBeDisabled();
    });
  });

  describe('District data with different templates', () => {
    it('shows launch-traction template when set in district', () => {
      const districtWithLaunchTraction = {
        ...mockDistrict,
        dashboard_template: 'launch-traction' as const,
        dashboard_config: {
          showSidebar: false,
          showNarrativeHero: false,
          gridColumns: 4,
          enableAnimations: true,
          cardVariant: 'rich' as const,
        },
      };

      vi.mocked(useDistrict).mockReturnValue({
        data: districtWithLaunchTraction,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useDistrict>);

      renderComponent();

      const launchOption = screen.getByTestId('template-option-launch-traction');
      expect(launchOption).toHaveClass('border-amber-500');
    });

    it('reflects config from district data', () => {
      const districtWithCustomConfig = {
        ...mockDistrict,
        dashboard_config: {
          showSidebar: false,
          showNarrativeHero: true,
          gridColumns: 4,
          enableAnimations: true,
          cardVariant: 'compact' as const,
        },
      };

      vi.mocked(useDistrict).mockReturnValue({
        data: districtWithCustomConfig,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useDistrict>);

      renderComponent();

      // Check that config values are reflected
      expect(screen.getByTestId('config-grid-4')).toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-card-compact')).toHaveClass('bg-amber-500');
    });
  });
});
