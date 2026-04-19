import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/setup';
import { AccordionGoalRow } from '../AccordionGoalRow';

const baseProps = {
  id: 'goal-1-1',
  badgeText: '1.1',
  title: 'ELA / Reading Proficiency',
  description: 'State assessment proficiency, all grade bands',
  currentValue: '72',
  targetValue: '85%',
  currentUnit: 'proficiency',
  status: 'in-progress' as const,
};

describe('AccordionGoalRow', () => {
  describe('collapsed state', () => {
    it('renders the title and description', () => {
      render(
        <AccordionGoalRow {...baseProps}>
          <div>expanded content</div>
        </AccordionGoalRow>
      );

      expect(screen.getByText('ELA / Reading Proficiency')).toBeInTheDocument();
      expect(
        screen.getByText('State assessment proficiency, all grade bands')
      ).toBeInTheDocument();
    });

    it('renders the badge text', () => {
      render(<AccordionGoalRow {...baseProps}>content</AccordionGoalRow>);

      expect(screen.getByText('1.1')).toBeInTheDocument();
    });

    it('renders current and target values', () => {
      render(<AccordionGoalRow {...baseProps}>content</AccordionGoalRow>);

      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText('/ 85%')).toBeInTheDocument();
      expect(screen.getByText('proficiency')).toBeInTheDocument();
    });

    it('renders a StatusChip with the matching status class', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps}>content</AccordionGoalRow>
      );

      expect(container.querySelector('.chip.chip-in-progress')).toBeInTheDocument();
    });

    it('does not render the expanded pane when collapsed', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps}>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      expect(container.querySelector('.subgoal-expanded')).toBeNull();
      expect(screen.queryByTestId('expanded-child')).toBeNull();
    });

    it('has aria-expanded="false" when collapsed', () => {
      render(<AccordionGoalRow {...baseProps}>content</AccordionGoalRow>);

      const row = screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ });
      expect(row).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('badge sizing', () => {
    it('uses num-badge class at default size', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps}>content</AccordionGoalRow>
      );

      expect(container.querySelector('.num-badge')).toBeInTheDocument();
      expect(container.querySelector('.num-badge-sm')).toBeNull();
    });

    it('uses num-badge-sm class when badgeSize="sm"', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps} badgeSize="sm">
          content
        </AccordionGoalRow>
      );

      expect(container.querySelector('.num-badge-sm')).toBeInTheDocument();
    });
  });

  describe('uncontrolled mode', () => {
    it('renders open when defaultOpen is true', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps} defaultOpen>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      expect(container.querySelector('.subgoal-row.open')).toBeInTheDocument();
      expect(container.querySelector('.subgoal-expanded')).toBeInTheDocument();
      expect(screen.getByTestId('expanded-child')).toBeInTheDocument();
    });

    it('has aria-expanded="true" when open', () => {
      render(
        <AccordionGoalRow {...baseProps} defaultOpen>
          content
        </AccordionGoalRow>
      );

      const row = screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ });
      expect(row).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles open on click', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps}>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      const row = screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ });

      fireEvent.click(row);
      expect(container.querySelector('.subgoal-expanded')).toBeInTheDocument();
      expect(row).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(row);
      expect(container.querySelector('.subgoal-expanded')).toBeNull();
      expect(row).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles open on Enter key', () => {
      render(<AccordionGoalRow {...baseProps}>content</AccordionGoalRow>);

      const row = screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ });

      fireEvent.keyDown(row, { key: 'Enter' });
      expect(row).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles open on Space key', () => {
      render(<AccordionGoalRow {...baseProps}>content</AccordionGoalRow>);

      const row = screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ });

      fireEvent.keyDown(row, { key: ' ' });
      expect(row).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('controlled mode', () => {
    it('reflects the open prop', () => {
      const { container, rerender } = render(
        <AccordionGoalRow {...baseProps} open={false}>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      expect(container.querySelector('.subgoal-expanded')).toBeNull();

      rerender(
        <AccordionGoalRow {...baseProps} open={true}>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      expect(container.querySelector('.subgoal-expanded')).toBeInTheDocument();
    });

    it('calls onOpenChange when clicked but does not self-toggle', () => {
      const onOpenChange = vi.fn();
      const { container } = render(
        <AccordionGoalRow
          {...baseProps}
          open={false}
          onOpenChange={onOpenChange}
        >
          content
        </AccordionGoalRow>
      );

      fireEvent.click(screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(container.querySelector('.subgoal-expanded')).toBeNull();
    });
  });

  describe('event propagation', () => {
    it('stops click propagation to prevent parent handler firing', () => {
      const parentClick = vi.fn();
      render(
        <div onClick={parentClick}>
          <AccordionGoalRow {...baseProps}>content</AccordionGoalRow>
        </div>
      );

      fireEvent.click(screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ }));

      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe('wiring', () => {
    it('sets aria-controls to match the expanded pane id', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps} defaultOpen>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      const row = screen.getByRole('button', { name: /ELA \/ Reading Proficiency/ });
      const paneId = row.getAttribute('aria-controls');
      expect(paneId).toBeTruthy();
      const pane = container.querySelector(`#${paneId}`);
      expect(pane).toHaveClass('subgoal-expanded');
    });

    it('renders a caret SVG inside the row', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps}>content</AccordionGoalRow>
      );

      expect(container.querySelector('svg.caret')).toBeInTheDocument();
    });

    it('renders children inside .subgoal-expanded when open', () => {
      const { container } = render(
        <AccordionGoalRow {...baseProps} defaultOpen>
          <div data-testid="expanded-child">expanded</div>
        </AccordionGoalRow>
      );

      const pane = container.querySelector('.subgoal-expanded');
      expect(pane).toContainElement(screen.getByTestId('expanded-child'));
    });
  });
});
