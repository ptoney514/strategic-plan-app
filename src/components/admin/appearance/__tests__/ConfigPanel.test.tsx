import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigPanel } from '../config-panel/ConfigPanel';
import { AppearanceProvider } from '../AppearanceContext';
import type { AppearanceState } from '../../../../hooks/useAppearanceState';

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const React = await import('react');
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { initial, animate, exit, transition, whileHover, whileTap, layout, ...rest } = props;
          return React.createElement(prop as string, { ...rest, ref });
        });
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock TemplateRegistry
vi.mock('../../../../components/public/templates/TemplateRegistry', () => ({
  getAllTemplates: () => [
    { id: 'hierarchical', name: 'Hierarchical', description: 'Traditional layout', defaultConfig: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: false, cardVariant: 'default' } },
    { id: 'metrics-grid', name: 'Metrics Grid', description: 'Flat grid', defaultConfig: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: true, cardVariant: 'compact' } },
    { id: 'launch-traction', name: 'Launch Traction', description: 'Animated dashboard', defaultConfig: { showSidebar: false, showNarrativeHero: false, gridColumns: 4, enableAnimations: true, cardVariant: 'rich' } },
  ],
  getTemplateInfo: (id: string) => {
    const t: Record<string, unknown> = {
      hierarchical: { id: 'hierarchical', name: 'Hierarchical', defaultConfig: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: false, cardVariant: 'default' } },
      'metrics-grid': { id: 'metrics-grid', name: 'Metrics Grid', defaultConfig: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: true, cardVariant: 'compact' } },
      'launch-traction': { id: 'launch-traction', name: 'Launch Traction', defaultConfig: { showSidebar: false, showNarrativeHero: false, gridColumns: 4, enableAnimations: true, cardVariant: 'rich' } },
    };
    return t[id] || t.hierarchical;
  },
  getMergedConfig: (templateId: string, customConfig?: Record<string, unknown>) => {
    const defaults: Record<string, Record<string, unknown>> = {
      hierarchical: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: false, cardVariant: 'default' },
      'metrics-grid': { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: true, cardVariant: 'compact' },
      'launch-traction': { showSidebar: false, showNarrativeHero: false, gridColumns: 4, enableAnimations: true, cardVariant: 'rich' },
    };
    return { ...(defaults[templateId] || defaults.hierarchical), ...customConfig };
  },
}));

// Mock useImageUpload
vi.mock('../../../../hooks/useUpload', () => ({
  useImageUpload: vi.fn(() => ({
    upload: vi.fn(),
    isUploading: false,
    progress: null,
    error: null,
    reset: vi.fn(),
  })),
}));

const mockDispatch = vi.fn();
const mockSave = vi.fn();

const defaultState: AppearanceState = {
  primaryColor: '#0099CC',
  secondaryColor: '#FFB800',
  logoUrl: '',
  dashboardTemplate: 'hierarchical',
  dashboardConfig: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: false, cardVariant: 'default' },
  isDirty: false,
};

function renderConfigPanel(overrides?: Partial<AppearanceState>) {
  const state = { ...defaultState, ...overrides };
  return render(
    <AppearanceProvider
      value={{
        state,
        dispatch: mockDispatch,
        districtName: 'Test District',
        districtSlug: 'test-district',
        save: mockSave,
        isSaving: false,
      }}
    >
      <ConfigPanel />
    </AppearanceProvider>
  );
}

function expandSection(title: string) {
  const btn = screen.getByText(title).closest('button');
  if (btn) fireEvent.click(btn);
}

describe('ConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Section rendering', () => {
    it('renders all config sections', () => {
      renderConfigPanel();

      expect(screen.getByText('Brand Colors')).toBeInTheDocument();
      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Template')).toBeInTheDocument();
      expect(screen.getByText('Layout Options')).toBeInTheDocument();
      expect(screen.getByText('Grid Density')).toBeInTheDocument();
      expect(screen.getByText('Card Style')).toBeInTheDocument();
    });

    it('shows save button with Save Changes text', () => {
      renderConfigPanel();

      expect(screen.getByTestId('appearance-save-btn')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('shows Unsaved text when dirty', () => {
      renderConfigPanel({ isDirty: true });
      expect(screen.getByText('Unsaved')).toBeInTheDocument();
    });

    it('does not show Unsaved text when not dirty', () => {
      renderConfigPanel({ isDirty: false });
      expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
    });
  });

  describe('Color input changes', () => {
    it('dispatches SET_PRIMARY_COLOR when primary color changes', () => {
      renderConfigPanel();

      const primaryInput = screen.getByTestId('color-primary-input');
      fireEvent.change(primaryInput, { target: { value: '#FF0000' } });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_PRIMARY_COLOR', payload: '#FF0000' });
    });

    it('dispatches SET_SECONDARY_COLOR when secondary color changes', () => {
      renderConfigPanel();

      const secondaryInput = screen.getByTestId('color-secondary-input');
      fireEvent.change(secondaryInput, { target: { value: '#00FF00' } });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_SECONDARY_COLOR', payload: '#00FF00' });
    });
  });

  describe('Template selection', () => {
    it('dispatches SET_TEMPLATE when template is selected', () => {
      renderConfigPanel();

      const metricsOption = screen.getByTestId('template-option-metrics-grid');
      fireEvent.click(metricsOption);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_TEMPLATE', payload: 'metrics-grid' });
    });
  });

  describe('Save button', () => {
    it('calls save when clicked', () => {
      renderConfigPanel();

      fireEvent.click(screen.getByTestId('appearance-save-btn'));
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Layout options', () => {
    it('dispatches UPDATE_CONFIG when sidebar toggle is clicked', () => {
      renderConfigPanel();
      expandSection('Layout Options');

      const toggle = screen.getByTestId('config-show-sidebar');
      fireEvent.click(toggle);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_CONFIG',
        payload: { showSidebar: false },
      });
    });
  });
});
