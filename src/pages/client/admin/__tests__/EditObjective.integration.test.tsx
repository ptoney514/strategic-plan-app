import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditObjective } from '../EditObjective';
import type { Goal } from '../../../../lib/types';

const hoisted = vi.hoisted(() => ({
  objectiveId: 'objective-1',
  mockNavigate: vi.fn(),
  mockUseDistrict: vi.fn(),
  mockUseGoal: vi.fn(),
  mockUseChildGoals: vi.fn(),
  mockUseUpdateGoal: vi.fn(),
  mockObjectiveUpdate: vi.fn(),
  mockGoalGetChildren: vi.fn(),
  mockGoalUpdate: vi.fn(),
  mockGoalCreate: vi.fn(),
  mockGoalDelete: vi.fn(),
  mockMetricGetByGoal: vi.fn(),
  mockMetricCreate: vi.fn(),
  mockMetricUpdate: vi.fn(),
  mockMetricDelete: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockToastInfo: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ objectiveId: hoisted.objectiveId }),
    useNavigate: () => hoisted.mockNavigate,
  };
});

vi.mock('../../../../contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-district' }),
}));

vi.mock('../../../../hooks/useDistricts', () => ({
  useDistrict: hoisted.mockUseDistrict,
}));

vi.mock('../../../../hooks/useGoals', () => ({
  useGoal: hoisted.mockUseGoal,
  useChildGoals: hoisted.mockUseChildGoals,
  useUpdateGoal: hoisted.mockUseUpdateGoal,
}));

vi.mock('../../../../lib/services/goals.service', () => ({
  GoalsService: {
    getChildren: hoisted.mockGoalGetChildren,
    update: hoisted.mockGoalUpdate,
    create: hoisted.mockGoalCreate,
    delete: hoisted.mockGoalDelete,
  },
}));

vi.mock('../../../../lib/services/metrics.service', () => ({
  MetricsService: {
    getByGoal: hoisted.mockMetricGetByGoal,
    create: hoisted.mockMetricCreate,
    update: hoisted.mockMetricUpdate,
    delete: hoisted.mockMetricDelete,
  },
}));

vi.mock('../../../../components/Toast', () => ({
  toast: {
    success: hoisted.mockToastSuccess,
    error: hoisted.mockToastError,
    info: hoisted.mockToastInfo,
  },
}));

const createGoal = (overrides: Partial<Goal>): Goal => ({
  id: 'goal-default',
  district_id: 'district-1',
  school_id: null,
  plan_id: 'plan-1',
  parent_id: null,
  goal_number: '1',
  title: 'Default Goal',
  level: 1,
  order_position: 0,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  show_progress_bar: true,
  is_public: true,
  metrics: [],
  ...overrides,
});

const objective = createGoal({
  id: hoisted.objectiveId,
  title: 'District Objective',
  goal_number: '1',
  level: 0,
  parent_id: null,
});

const level1GoalA = createGoal({
  id: 'goal-1',
  title: 'Goal One',
  goal_number: '1.1',
  level: 1,
  parent_id: hoisted.objectiveId,
});

const level1GoalB = createGoal({
  id: 'goal-2',
  title: 'Goal Two',
  goal_number: '1.2',
  level: 1,
  parent_id: hoisted.objectiveId,
});

const subGoalA = createGoal({
  id: 'sub-a-1',
  title: 'Sub Goal A',
  goal_number: '1.1.1',
  level: 2,
  parent_id: level1GoalA.id,
});

const subGoalB = createGoal({
  id: 'sub-b-1',
  title: 'Sub Goal B',
  goal_number: '1.2.1',
  level: 2,
  parent_id: level1GoalB.id,
});

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
      <BrowserRouter>
        <EditObjective />
      </BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('EditObjective integration - hierarchy persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hoisted.mockUseDistrict.mockReturnValue({
      data: { id: 'district-1', name: 'Test District', slug: 'test-district' },
      isLoading: false,
      error: null,
    });

    hoisted.mockUseGoal.mockReturnValue({
      data: objective,
      isLoading: false,
      error: null,
    });

    hoisted.mockUseChildGoals.mockReturnValue({
      data: [level1GoalA, level1GoalB],
      isLoading: false,
      error: null,
    });

    hoisted.mockUseUpdateGoal.mockReturnValue({
      mutateAsync: hoisted.mockObjectiveUpdate,
      isPending: false,
      error: null,
    });

    hoisted.mockObjectiveUpdate.mockResolvedValue(objective);

    hoisted.mockGoalGetChildren.mockImplementation(async (parentId: string) => {
      if (parentId === hoisted.objectiveId) return [level1GoalA, level1GoalB];
      if (parentId === level1GoalA.id) return [subGoalA];
      if (parentId === level1GoalB.id) return [subGoalB];
      return [];
    });

    hoisted.mockGoalUpdate.mockImplementation(async (id: string, updates: Partial<Goal>) => ({
      ...createGoal({ id }),
      ...updates,
    }));

    hoisted.mockGoalCreate.mockImplementation(async (payload: Partial<Goal>) =>
      createGoal({
        id: 'sub-created-1',
        ...payload,
      }),
    );

    hoisted.mockGoalDelete.mockResolvedValue(undefined);
    hoisted.mockMetricGetByGoal.mockResolvedValue([]);
    hoisted.mockMetricCreate.mockResolvedValue(undefined);
    hoisted.mockMetricUpdate.mockResolvedValue(undefined);
    hoisted.mockMetricDelete.mockResolvedValue(undefined);
  });

  it('persists a new sub-goal and deletes removed goals/sub-goals on save', async () => {
    renderComponent();

    await screen.findByText('Sub Goal A');
    expect(screen.getByText('Sub Goal B')).toBeInTheDocument();

    // Remove an existing sub-goal (Sub Goal A).
    fireEvent.click(screen.getAllByTitle('Delete Sub-goal')[0]);
    await waitFor(() => {
      expect(screen.queryByText('Sub Goal A')).not.toBeInTheDocument();
    });

    // Remove Goal Two, confirm cascading sub-goal deletion in UI.
    fireEvent.click(screen.getAllByTitle('Delete Goal')[1]);
    expect(await screen.findByText('Delete goal and sub-goals?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Goal & Sub-goals' }));

    await waitFor(() => {
      expect(screen.queryByText('Goal Two')).not.toBeInTheDocument();
    });

    // Add a new sub-goal under Goal One.
    fireEvent.click(screen.getAllByTitle('Add Sub-goal')[0]);
    fireEvent.change(
      await screen.findByPlaceholderText('e.g., Grow and nurture a district culture'),
      {
      target: { value: 'New Sub Goal' },
      },
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Create Goal' })[0]);

    await waitFor(() => {
      expect(screen.queryByLabelText(/Goal Title/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(hoisted.mockObjectiveUpdate).toHaveBeenCalledTimes(1);
      expect(hoisted.mockGoalCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 2,
          parent_id: level1GoalA.id,
          plan_id: objective.plan_id,
          title: 'New Sub Goal',
        }),
      );
      expect(hoisted.mockGoalDelete).toHaveBeenCalledWith(subGoalA.id);
      expect(hoisted.mockGoalDelete).toHaveBeenCalledWith(level1GoalB.id);
      expect(hoisted.mockGoalDelete).not.toHaveBeenCalledWith(subGoalB.id);
    });
  });
});
