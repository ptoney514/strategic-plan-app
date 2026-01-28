import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { TemplateSelector } from '../TemplateSelector';
import type { DashboardTemplate } from '../../../lib/types';

// Mock the TemplateRegistry to avoid external dependencies
vi.mock('../../public/templates/TemplateRegistry', () => ({
  getAllTemplates: () => [
    {
      id: 'hierarchical' as DashboardTemplate,
      name: 'Hierarchical',
      description: 'Traditional strategic plan layout',
      defaultConfig: {
        showSidebar: true,
        showNarrativeHero: true,
        gridColumns: 3,
        enableAnimations: false,
        cardVariant: 'default',
      },
    },
    {
      id: 'metrics-grid' as DashboardTemplate,
      name: 'Metrics Grid',
      description: 'Flat grid of KPI cards',
      defaultConfig: {
        showSidebar: true,
        showNarrativeHero: true,
        gridColumns: 3,
        enableAnimations: true,
        cardVariant: 'compact',
      },
    },
    {
      id: 'launch-traction' as DashboardTemplate,
      name: 'Launch Traction',
      description: 'Animated dashboard with counters',
      defaultConfig: {
        showSidebar: false,
        showNarrativeHero: false,
        gridColumns: 4,
        enableAnimations: true,
        cardVariant: 'rich',
      },
    },
  ],
}));

describe('TemplateSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all 3 template options', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('template-option-hierarchical')).toBeInTheDocument();
      expect(screen.getByTestId('template-option-metrics-grid')).toBeInTheDocument();
      expect(screen.getByTestId('template-option-launch-traction')).toBeInTheDocument();
    });

    it('displays template names correctly', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Hierarchical')).toBeInTheDocument();
      expect(screen.getByText('Metrics Grid')).toBeInTheDocument();
      expect(screen.getByText('Launch Traction')).toBeInTheDocument();
    });

    it('displays description text for each option', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/Traditional strategic plan/i)).toBeInTheDocument();
      expect(screen.getByText(/Flat grid of KPI cards/i)).toBeInTheDocument();
      expect(screen.getByText(/Animated dashboard with counters/i)).toBeInTheDocument();
    });

    it('renders template selector container', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('highlights selected template with amber border', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      const selectedOption = screen.getByTestId('template-option-hierarchical');
      expect(selectedOption).toHaveClass('border-amber-500');
    });

    it('does not highlight unselected templates', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      const unselectedOption = screen.getByTestId('template-option-metrics-grid');
      expect(unselectedOption).not.toHaveClass('border-amber-500');
    });

    it('calls onChange when template clicked', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('template-option-metrics-grid'));
      expect(mockOnChange).toHaveBeenCalledWith('metrics-grid');
    });

    it('calls onChange with correct template id for each option', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByTestId('template-option-launch-traction'));
      expect(mockOnChange).toHaveBeenCalledWith('launch-traction');

      fireEvent.click(screen.getByTestId('template-option-hierarchical'));
      expect(mockOnChange).toHaveBeenCalledWith('hierarchical');
    });

    it('shows amber background on selected template icon', () => {
      render(
        <TemplateSelector
          value="metrics-grid"
          onChange={mockOnChange}
        />
      );

      const selectedOption = screen.getByTestId('template-option-metrics-grid');
      expect(selectedOption).toHaveClass('border-amber-500');
      expect(selectedOption).toHaveClass('bg-amber-50');
    });
  });

  describe('Disabled state', () => {
    it('disables all buttons when disabled=true', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByTestId('template-option-hierarchical')).toBeDisabled();
      expect(screen.getByTestId('template-option-metrics-grid')).toBeDisabled();
      expect(screen.getByTestId('template-option-launch-traction')).toBeDisabled();
    });

    it('shows opacity-50 when disabled', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const option = screen.getByTestId('template-option-hierarchical');
      expect(option).toHaveClass('opacity-50');
    });

    it('shows cursor-not-allowed when disabled', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const option = screen.getByTestId('template-option-hierarchical');
      expect(option).toHaveClass('cursor-not-allowed');
    });

    it('does not call onChange when disabled and clicked', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByTestId('template-option-metrics-grid'));
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Different template selections', () => {
    it('correctly highlights hierarchical when selected', () => {
      render(
        <TemplateSelector
          value="hierarchical"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('template-option-hierarchical')).toHaveClass('border-amber-500');
      expect(screen.getByTestId('template-option-metrics-grid')).not.toHaveClass('border-amber-500');
      expect(screen.getByTestId('template-option-launch-traction')).not.toHaveClass('border-amber-500');
    });

    it('correctly highlights metrics-grid when selected', () => {
      render(
        <TemplateSelector
          value="metrics-grid"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('template-option-hierarchical')).not.toHaveClass('border-amber-500');
      expect(screen.getByTestId('template-option-metrics-grid')).toHaveClass('border-amber-500');
      expect(screen.getByTestId('template-option-launch-traction')).not.toHaveClass('border-amber-500');
    });

    it('correctly highlights launch-traction when selected', () => {
      render(
        <TemplateSelector
          value="launch-traction"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('template-option-hierarchical')).not.toHaveClass('border-amber-500');
      expect(screen.getByTestId('template-option-metrics-grid')).not.toHaveClass('border-amber-500');
      expect(screen.getByTestId('template-option-launch-traction')).toHaveClass('border-amber-500');
    });
  });
});
