import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard2 } from '../AdminDashboard2';
import type { HierarchicalGoal } from '../../../../lib/types';

// Mock the hooks
vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: vi.fn(() => ({
    data: { id: 'district-1', name: 'Test District', slug: 'test-district' },
    isLoading: false,
  })),
}));

// Sample test data with NESTED hierarchy (matching what GoalsService returns)
const mockGoals: HierarchicalGoal[] = [
  // Level 0 - Strategic Objectives with nested children
  {
    id: 'goal-1',
    district_id: 'district-1',
    parent_id: null,
    goal_number: '1',
    title: 'Student Achievement',
    description: 'Improve student outcomes',
    level: 0,
    order_position: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [
      // Level 1 - Goals (nested children of goal-1)
      {
        id: 'goal-1-1',
        district_id: 'district-1',
        parent_id: 'goal-1',
        goal_number: '1.1',
        title: 'Improve Math Scores',
        description: 'Focus on math improvement',
        level: 1,
        order_position: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [
          // Level 2 - Sub-goals (nested children of goal-1-1)
          {
            id: 'goal-1-1-1',
            district_id: 'district-1',
            parent_id: 'goal-1-1',
            goal_number: '1.1.1',
            title: 'Algebra Tutoring Program',
            level: 2,
            order_position: 1,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            children: [],
          },
          {
            id: 'goal-1-1-2',
            district_id: 'district-1',
            parent_id: 'goal-1-1',
            goal_number: '1.1.2',
            title: 'Math Teacher Training',
            level: 2,
            order_position: 2,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            children: [],
          },
        ],
      },
      {
        id: 'goal-1-2',
        district_id: 'district-1',
        parent_id: 'goal-1',
        goal_number: '1.2',
        title: 'Improve Reading Scores',
        description: 'Focus on reading improvement',
        level: 1,
        order_position: 2,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        children: [], // No grandchildren for this goal
      },
    ],
  },
  {
    id: 'goal-2',
    district_id: 'district-1',
    parent_id: null,
    goal_number: '2',
    title: 'Resource Optimization',
    description: 'Optimize district resources',
    level: 0,
    order_position: 2,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    children: [], // No children for this objective
  },
];

vi.mock('../../../../hooks/useGoals', () => ({
  useGoals: vi.fn(() => ({
    data: mockGoals,
    isLoading: false,
  })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'test-district' }),
  };
});

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AdminDashboard2 />
    </BrowserRouter>
  );
};

describe('AdminDashboard2 - Expand/Collapse Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render level 0 objectives', () => {
      renderComponent();

      expect(screen.getByText('Student Achievement')).toBeInTheDocument();
      expect(screen.getByText('Resource Optimization')).toBeInTheDocument();
    });

    it('should not show children initially', () => {
      renderComponent();

      // Level 1 goals should not be visible initially
      expect(screen.queryByText('Improve Math Scores')).not.toBeInTheDocument();
      expect(screen.queryByText('Improve Reading Scores')).not.toBeInTheDocument();
    });

    it('should show expand button for objectives with children', () => {
      renderComponent();

      const expandButtons = screen.getAllByTestId('expand-btn');
      // First objective has children, should not be disabled
      expect(expandButtons[0]).not.toBeDisabled();
    });

    it('should disable expand button for objectives without children', () => {
      renderComponent();

      const expandButtons = screen.getAllByTestId('expand-btn');
      // Second objective (Resource Optimization) has no children
      expect(expandButtons[1]).toBeDisabled();
    });
  });

  describe('Expand/Collapse Single Objective', () => {
    it('should show children when expand button is clicked', () => {
      renderComponent();

      // Click expand button on first objective
      const expandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(expandButtons[0]);

      // Level 1 children should now be visible
      expect(screen.getByText('Improve Math Scores')).toBeInTheDocument();
      expect(screen.getByText('Improve Reading Scores')).toBeInTheDocument();
    });

    it('should hide children when collapse button is clicked', () => {
      renderComponent();

      // Expand first
      const expandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(expandButtons[0]);

      // Verify children are visible
      expect(screen.getByText('Improve Math Scores')).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(expandButtons[0]);

      // Children should be hidden
      expect(screen.queryByText('Improve Math Scores')).not.toBeInTheDocument();
    });

    it('should show minus icon when expanded', () => {
      renderComponent();

      const expandButtons = screen.getAllByTestId('expand-btn');

      // Initially should have aria-expanded false
      expect(expandButtons[0]).toHaveAttribute('aria-expanded', 'false');

      // Click to expand
      fireEvent.click(expandButtons[0]);

      // Should now have aria-expanded true
      expect(expandButtons[0]).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Nested Expansion (Level 2)', () => {
    it('should show grandchildren when child expand button is clicked', () => {
      renderComponent();

      // First expand the parent objective
      const objectiveExpandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(objectiveExpandButtons[0]);

      // Now find and click the child expand button
      const childExpandButtons = screen.getAllByTestId('child-expand-btn');
      fireEvent.click(childExpandButtons[0]); // Expand "Improve Math Scores"

      // Level 2 grandchildren should now be visible
      expect(screen.getByText('Algebra Tutoring Program')).toBeInTheDocument();
      expect(screen.getByText('Math Teacher Training')).toBeInTheDocument();
    });

    it('should hide grandchildren when child collapse button is clicked', () => {
      renderComponent();

      // Expand parent and child
      const objectiveExpandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(objectiveExpandButtons[0]);

      const childExpandButtons = screen.getAllByTestId('child-expand-btn');
      fireEvent.click(childExpandButtons[0]);

      // Verify grandchildren are visible
      expect(screen.getByText('Algebra Tutoring Program')).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(childExpandButtons[0]);

      // Grandchildren should be hidden
      expect(screen.queryByText('Algebra Tutoring Program')).not.toBeInTheDocument();
    });
  });

  describe('Expand All / Collapse All', () => {
    it('should expand all objectives when Expand all is clicked', () => {
      renderComponent();

      // Click expand all
      const expandAllButton = screen.getByTestId('expand-all-btn');
      fireEvent.click(expandAllButton);

      // All children should be visible
      expect(screen.getByText('Improve Math Scores')).toBeInTheDocument();
      expect(screen.getByText('Improve Reading Scores')).toBeInTheDocument();
    });

    it('should collapse all objectives when Collapse all is clicked', () => {
      renderComponent();

      // First expand all
      const expandAllButton = screen.getByTestId('expand-all-btn');
      fireEvent.click(expandAllButton);

      // Verify expanded
      expect(screen.getByText('Improve Math Scores')).toBeInTheDocument();

      // Now collapse all
      const collapseAllButton = screen.getByTestId('collapse-all-btn');
      fireEvent.click(collapseAllButton);

      // Children should be hidden
      expect(screen.queryByText('Improve Math Scores')).not.toBeInTheDocument();
    });
  });

  describe('Visual Hierarchy', () => {
    it('should render children container when expanded', () => {
      renderComponent();

      const expandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(expandButtons[0]);

      const childrenContainer = screen.getByTestId('children-container');
      expect(childrenContainer).toBeInTheDocument();
    });

    it('should render grandchildren container when child is expanded', () => {
      renderComponent();

      // Expand parent and child
      const objectiveExpandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(objectiveExpandButtons[0]);

      const childExpandButtons = screen.getAllByTestId('child-expand-btn');
      fireEvent.click(childExpandButtons[0]);

      const grandchildrenContainer = screen.getByTestId('grandchildren-container');
      expect(grandchildrenContainer).toBeInTheDocument();
    });

    it('should display goal numbers correctly', () => {
      renderComponent();

      // First expand the parent objective manually
      const objectiveExpandButtons = screen.getAllByTestId('expand-btn');
      fireEvent.click(objectiveExpandButtons[0]);

      // Check level 0 and level 1 goal numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('1.1')).toBeInTheDocument();
      expect(screen.getByText('1.2')).toBeInTheDocument();

      // Now expand the child to show grandchildren
      const childExpandButtons = screen.getAllByTestId('child-expand-btn');
      fireEvent.click(childExpandButtons[0]);

      // Verify grandchildren are visible via their titles
      expect(screen.getByText('Algebra Tutoring Program')).toBeInTheDocument();
      expect(screen.getByText('Math Teacher Training')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct aria-expanded attribute', () => {
      renderComponent();

      const expandButtons = screen.getAllByTestId('expand-btn');

      // Initially false
      expect(expandButtons[0]).toHaveAttribute('aria-expanded', 'false');

      // After expand, should be true
      fireEvent.click(expandButtons[0]);
      expect(expandButtons[0]).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-label on expand buttons', () => {
      renderComponent();

      const expandButtons = screen.getAllByTestId('expand-btn');
      expect(expandButtons[0]).toHaveAttribute('aria-label', 'Expand');

      fireEvent.click(expandButtons[0]);
      expect(expandButtons[0]).toHaveAttribute('aria-label', 'Collapse');
    });
  });
});
