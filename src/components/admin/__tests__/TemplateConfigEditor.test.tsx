import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { TemplateConfigEditor } from '../TemplateConfigEditor';
import type { DashboardTemplate, DashboardConfig } from '../../../lib/types';

// Mock the TemplateRegistry
vi.mock('../../public/templates/TemplateRegistry', () => ({
  getTemplateInfo: (templateId: DashboardTemplate) => {
    const templates = {
      hierarchical: {
        id: 'hierarchical',
        name: 'Hierarchical',
        description: 'Traditional strategic plan layout',
        defaultConfig: {
          showSidebar: true,
          showNarrativeHero: true,
          gridColumns: 3,
          enableAnimations: false,
          cardVariant: 'default' as const,
        },
      },
      'metrics-grid': {
        id: 'metrics-grid',
        name: 'Metrics Grid',
        description: 'Flat grid of KPI cards',
        defaultConfig: {
          showSidebar: true,
          showNarrativeHero: true,
          gridColumns: 3,
          enableAnimations: true,
          cardVariant: 'compact' as const,
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
          cardVariant: 'rich' as const,
        },
      },
    };
    return templates[templateId] || templates.hierarchical;
  },
}));

describe('TemplateConfigEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders config container', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('template-config')).toBeInTheDocument();
    });

    it('renders Template Options header', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Template Options')).toBeInTheDocument();
    });

    it('renders all toggle options', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-show-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('config-show-hero')).toBeInTheDocument();
      expect(screen.getByTestId('config-enable-animations')).toBeInTheDocument();
    });

    it('renders all grid column buttons', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-grid-2')).toBeInTheDocument();
      expect(screen.getByTestId('config-grid-3')).toBeInTheDocument();
      expect(screen.getByTestId('config-grid-4')).toBeInTheDocument();
    });

    it('renders all card style buttons', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-card-default')).toBeInTheDocument();
      expect(screen.getByTestId('config-card-compact')).toBeInTheDocument();
      expect(screen.getByTestId('config-card-rich')).toBeInTheDocument();
    });

    it('displays correct labels and descriptions', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Show Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Display navigation sidebar with objectives')).toBeInTheDocument();
      expect(screen.getByText('Show Hero Section')).toBeInTheDocument();
      expect(screen.getByText('Enable Animations')).toBeInTheDocument();
      expect(screen.getByText('Grid Columns')).toBeInTheDocument();
      expect(screen.getByText('Card Style')).toBeInTheDocument();
    });
  });

  describe('Toggles', () => {
    it('sidebar toggle calls onChange with showSidebar', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ showSidebar: true }}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-show-sidebar'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ showSidebar: false })
      );
    });

    it('hero toggle calls onChange with showNarrativeHero', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ showNarrativeHero: true }}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-show-hero'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ showNarrativeHero: false })
      );
    });

    it('animations toggle calls onChange with enableAnimations', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ enableAnimations: false }}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-enable-animations'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ enableAnimations: true })
      );
    });

    it('toggles reflect current config state', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ showSidebar: false, showNarrativeHero: true, enableAnimations: true }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-show-sidebar')).not.toBeChecked();
      expect(screen.getByTestId('config-show-hero')).toBeChecked();
      expect(screen.getByTestId('config-enable-animations')).toBeChecked();
    });
  });

  describe('Button groups', () => {
    it('grid column button 2 calls onChange with gridColumns: 2', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-grid-2'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ gridColumns: 2 })
      );
    });

    it('grid column button 3 calls onChange with gridColumns: 3', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-grid-3'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ gridColumns: 3 })
      );
    });

    it('grid column button 4 calls onChange with gridColumns: 4', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-grid-4'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ gridColumns: 4 })
      );
    });

    it('card style default button calls onChange with cardVariant: default', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-card-default'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cardVariant: 'default' })
      );
    });

    it('card style compact button calls onChange with cardVariant: compact', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-card-compact'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cardVariant: 'compact' })
      );
    });

    it('card style rich button calls onChange with cardVariant: rich', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('config-card-rich'));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ cardVariant: 'rich' })
      );
    });

    it('selected grid button shows amber background', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ gridColumns: 4 }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-grid-4')).toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-grid-2')).not.toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-grid-3')).not.toHaveClass('bg-amber-500');
    });

    it('selected card style button shows amber background', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ cardVariant: 'compact' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-card-compact')).toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-card-default')).not.toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-card-rich')).not.toHaveClass('bg-amber-500');
    });
  });

  describe('Default merging', () => {
    it('uses template defaults when config is empty', () => {
      // Hierarchical template defaults: showSidebar=true, gridColumns=3, cardVariant=default
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
        />
      );

      // Should show defaults from hierarchical template
      expect(screen.getByTestId('config-show-sidebar')).toBeChecked();
      expect(screen.getByTestId('config-grid-3')).toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-card-default')).toHaveClass('bg-amber-500');
    });

    it('custom config overrides defaults', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{ showSidebar: false, gridColumns: 4, cardVariant: 'rich' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-show-sidebar')).not.toBeChecked();
      expect(screen.getByTestId('config-grid-4')).toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-card-rich')).toHaveClass('bg-amber-500');
    });

    it('uses launch-traction defaults when template changes', () => {
      // Launch-traction template defaults: showSidebar=false, gridColumns=4, cardVariant=rich
      render(
        <TemplateConfigEditor
          template="launch-traction"
          config={{}}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('config-show-sidebar')).not.toBeChecked();
      expect(screen.getByTestId('config-grid-4')).toHaveClass('bg-amber-500');
      expect(screen.getByTestId('config-card-rich')).toHaveClass('bg-amber-500');
    });
  });

  describe('Disabled state', () => {
    it('disables all inputs when disabled=true', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      // Toggle inputs
      expect(screen.getByTestId('config-show-sidebar')).toBeDisabled();
      expect(screen.getByTestId('config-show-hero')).toBeDisabled();
      expect(screen.getByTestId('config-enable-animations')).toBeDisabled();

      // Grid buttons
      expect(screen.getByTestId('config-grid-2')).toBeDisabled();
      expect(screen.getByTestId('config-grid-3')).toBeDisabled();
      expect(screen.getByTestId('config-grid-4')).toBeDisabled();

      // Card style buttons
      expect(screen.getByTestId('config-card-default')).toBeDisabled();
      expect(screen.getByTestId('config-card-compact')).toBeDisabled();
      expect(screen.getByTestId('config-card-rich')).toBeDisabled();
    });

    it('does not call onChange when clicking disabled buttons', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      // Buttons should not call onChange when disabled
      // Note: We test buttons specifically as checkbox clicks on labels can still propagate
      fireEvent.click(screen.getByTestId('config-grid-4'));
      fireEvent.click(screen.getByTestId('config-card-rich'));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('shows opacity-50 on disabled buttons', () => {
      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={{}}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('config-grid-2')).toHaveClass('opacity-50');
      expect(screen.getByTestId('config-card-default')).toHaveClass('opacity-50');
    });
  });

  describe('Config preservation', () => {
    it('preserves existing config values when changing one option', () => {
      const initialConfig: DashboardConfig = {
        showSidebar: true,
        showNarrativeHero: false,
        enableAnimations: true,
        gridColumns: 2,
        cardVariant: 'compact',
      };

      render(
        <TemplateConfigEditor
          template="hierarchical"
          config={initialConfig}
          onChange={mockOnChange}
        />
      );

      // Click on grid 4 - should preserve other values
      fireEvent.click(screen.getByTestId('config-grid-4'));

      expect(mockOnChange).toHaveBeenCalledWith({
        ...initialConfig,
        gridColumns: 4,
      });
    });
  });
});
