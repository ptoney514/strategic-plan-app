import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewPanel } from '../preview-panel/PreviewPanel';
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
  getMergedConfig: (templateId: string, customConfig?: Record<string, unknown>) => {
    const defaults: Record<string, Record<string, unknown>> = {
      hierarchical: { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: false, cardVariant: 'default' },
      'metrics-grid': { showSidebar: true, showNarrativeHero: true, gridColumns: 3, enableAnimations: true, cardVariant: 'compact' },
      'launch-traction': { showSidebar: false, showNarrativeHero: false, gridColumns: 4, enableAnimations: true, cardVariant: 'rich' },
    };
    return { ...(defaults[templateId] || defaults.hierarchical), ...customConfig };
  },
}));

const mockDispatch = vi.fn();
const mockSave = vi.fn();

function renderPreviewPanel(overrides?: Partial<AppearanceState>) {
  const defaultState: AppearanceState = {
    primaryColor: '#0099CC',
    secondaryColor: '#FFB800',
    logoUrl: '',
    dashboardTemplate: 'hierarchical',
    dashboardConfig: {},
    isDirty: false,
  };
  const state = { ...defaultState, ...overrides };
  return render(
    <AppearanceProvider
      value={{
        state,
        dispatch: mockDispatch,
        districtName: 'Test District',
        districtTagline: 'Excellence in Education',
        districtSlug: 'test-district',
        save: mockSave,
        isSaving: false,
      }}
    >
      <PreviewPanel />
    </AppearanceProvider>
  );
}

describe('PreviewPanel', () => {
  describe('Toolbar', () => {
    it('shows browser chrome with district URL', () => {
      renderPreviewPanel();
      expect(screen.getByText(/test-district\.stratadash\.com/)).toBeInTheDocument();
    });

    it('shows Live Preview label', () => {
      renderPreviewPanel();
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('shows desktop and mobile toggle buttons', () => {
      renderPreviewPanel();
      expect(screen.getByTitle('Desktop preview')).toBeInTheDocument();
      expect(screen.getByTitle('Mobile preview')).toBeInTheDocument();
    });
  });

  describe('Renderer selection', () => {
    it('renders hierarchical template by default', () => {
      renderPreviewPanel({ dashboardTemplate: 'hierarchical' });
      // Hierarchical shows sidebar + PreviewHeader, both contain "STRATEGIC PLAN"
      const matches = screen.getAllByText('STRATEGIC PLAN');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('renders metrics-grid template', () => {
      renderPreviewPanel({ dashboardTemplate: 'metrics-grid' });
      // Metrics grid shows KPI cards
      expect(screen.getByText('Graduation Rate')).toBeInTheDocument();
      expect(screen.getByText('Attendance')).toBeInTheDocument();
    });

    it('renders launch-traction template with dark theme', () => {
      renderPreviewPanel({ dashboardTemplate: 'launch-traction' });
      // Launch traction shows counter items
      expect(screen.getByText('12,847')).toBeInTheDocument();
      expect(screen.getByText('Strategic Pillars')).toBeInTheDocument();
    });
  });

  describe('Device toggle', () => {
    it('defaults to desktop mode', () => {
      renderPreviewPanel();
      // Desktop button should have active styling
      const desktopBtn = screen.getByTitle('Desktop preview');
      expect(desktopBtn.closest('button')).toHaveClass('bg-white');
    });

    it('can switch to mobile mode', () => {
      renderPreviewPanel();
      fireEvent.click(screen.getByTitle('Mobile preview'));
      const mobileBtn = screen.getByTitle('Mobile preview');
      expect(mobileBtn.closest('button')).toHaveClass('bg-white');
    });
  });

  describe('District name display', () => {
    it('shows district name in preview', () => {
      renderPreviewPanel();
      const matches = screen.getAllByText('Test District');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
