import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { ObjectiveDetailView } from '../ObjectiveDetailView';

vi.mock('next/navigation', () => ({
  useParams: () => ({ objectiveId: 'obj-1' }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
}));

vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', is_active: true, is_public: true }],
    isLoading: false,
  }),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockUseWidgetsByGoals = vi.fn();
vi.mock('@/hooks/v2/useWidgets', () => ({
  useWidgetsByGoals: (...args: unknown[]) => mockUseWidgetsByGoals(...args),
}));

vi.mock('@/lib/utils/goalHealth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils/goalHealth')>('@/lib/utils/goalHealth');
  return {
    ...actual,
    computeGoalTrend: () => ({
      value: 72,
      delta: 7,
      direction: 'up' as const,
      target: 85,
      baseline: 65,
      progress: 72,
    }),
  };
});

const goals = [
  {
    id: 'obj-1',
    district_id: 'district-1',
    parent_id: null,
    goal_number: '1',
    title: 'Student achievement',
    description: 'Ensure all students achieve academic excellence.',
    level: 0,
    order_position: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'in_progress',
    overall_progress: 68,
    children: [
      {
        id: 'goal-1',
        district_id: 'district-1',
        parent_id: 'obj-1',
        goal_number: '1.1',
        title: 'ELA/Reading Proficiency',
        level: 1,
        order_position: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        status: 'in_progress',
        overall_progress: 72,
        children: [],
      },
      {
        id: 'goal-2',
        district_id: 'district-1',
        parent_id: 'obj-1',
        goal_number: '1.2',
        title: 'Mathematics Achievement',
        level: 1,
        order_position: 2,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        status: 'on_target',
        overall_progress: 65,
        children: [],
      },
    ],
  },
];

const widgets = [
  {
    id: 'w-1',
    organizationId: 'district-1',
    planId: 'plan-1',
    goalId: 'goal-1',
    type: 'bar-chart' as const,
    title: 'ELA Proficiency',
    config: {
      value: 72,
      baseline: 65,
      target: 85,
      unit: '%',
      dataPoints: [
        { label: '2022', value: 65 },
        { label: '2023', value: 69 },
        { label: '2024', value: 72 },
      ],
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'w-2',
    organizationId: 'district-1',
    planId: 'plan-1',
    goalId: 'goal-2',
    type: 'big-number' as const,
    title: 'Math Proficiency',
    config: {
      value: 65,
      target: 80,
      unit: '%',
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

describe('ObjectiveDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGoalsByPlan.mockReturnValue({
      data: goals,
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({
      data: widgets,
      isLoading: false,
    });
  });

  it('uses the stacked-first objective goal grid layout', () => {
    render(<ObjectiveDetailView />);

    const grid = screen.getByTestId('objective-detail-goal-grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('xl:grid-cols-2');
    expect(grid.className).not.toContain('md:grid-cols-2');
    expect(grid.className).not.toContain('xl:grid-cols-3');
    expect(screen.getByTestId('objective-goal-card-1.1')).toBeInTheDocument();
    expect(screen.getByTestId('objective-goal-card-1.2')).toBeInTheDocument();
  });
});
