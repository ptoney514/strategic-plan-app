import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlidePanel } from '../SlidePanel';

describe('SlidePanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render when open', () => {
    render(
      <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
        <div>Test Content</div>
      </SlidePanel>
    );

    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should not be visible when closed', () => {
    const { container } = render(
      <SlidePanel isOpen={false} onClose={mockOnClose} title="Test Panel">
        <div>Test Content</div>
      </SlidePanel>
    );

    // Check for translate-x-full class which moves panel off-screen
    const panel = container.querySelector('[role="dialog"]');
    expect(panel).toHaveClass('translate-x-full');
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
        <div>Test Content</div>
      </SlidePanel>
    );

    const closeButton = screen.getByLabelText('Close panel');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
        <div>Test Content</div>
      </SlidePanel>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(
      <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
        <div>Test Content</div>
      </SlidePanel>
    );

    // Click the overlay (backdrop)
    const overlay = container.querySelector('.fixed.inset-0.bg-black');
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render without title', () => {
    render(
      <SlidePanel isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </SlidePanel>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  describe('topBarColor prop', () => {
    it('should render success gradient bar by default', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const gradientBar = container.querySelector('.from-emerald-400');
      expect(gradientBar).toBeInTheDocument();
    });

    it('should render success gradient bar when topBarColor is success', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel" topBarColor="success">
          <div>Test Content</div>
        </SlidePanel>
      );

      const gradientBar = container.querySelector('.from-emerald-400');
      expect(gradientBar).toBeInTheDocument();
      expect(gradientBar).toHaveClass('via-emerald-500', 'to-teal-500');
    });

    it('should render warning gradient bar when topBarColor is warning', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel" topBarColor="warning">
          <div>Test Content</div>
        </SlidePanel>
      );

      const gradientBar = container.querySelector('.from-amber-500');
      expect(gradientBar).toBeInTheDocument();
      expect(gradientBar).toHaveClass('via-orange-600', 'to-red-600');
    });

    it('should have correct gradient bar height', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const gradientBar = container.querySelector('.h-1');
      expect(gradientBar).toBeInTheDocument();
      expect(gradientBar).toHaveClass('w-full', 'bg-gradient-to-r');
    });
  });

  describe('accessibility', () => {
    it('should have proper dialog role', () => {
      render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-modal attribute', () => {
      render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'slide-panel-title');
      expect(screen.getByText('Test Panel')).toHaveAttribute('id', 'slide-panel-title');
    });

    it('should have accessible close button', () => {
      render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const closeButton = screen.getByLabelText('Close panel');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should have full width on mobile and 40% on desktop', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const panel = container.querySelector('[role="dialog"]');
      expect(panel).toHaveClass('w-full', 'md:w-[40%]');
    });
  });

  describe('animation classes', () => {
    it('should have transition classes', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const panel = container.querySelector('[role="dialog"]');
      expect(panel).toHaveClass('transition-transform', 'duration-300', 'ease-out');
    });

    it('should have correct transform when open', () => {
      const { container } = render(
        <SlidePanel isOpen={true} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const panel = container.querySelector('[role="dialog"]');
      expect(panel).toHaveClass('translate-x-0');
    });

    it('should have correct transform when closed', () => {
      const { container } = render(
        <SlidePanel isOpen={false} onClose={mockOnClose} title="Test Panel">
          <div>Test Content</div>
        </SlidePanel>
      );

      const panel = container.querySelector('[role="dialog"]');
      expect(panel).toHaveClass('translate-x-full');
    });
  });
});
