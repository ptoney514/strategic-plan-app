import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { PublicSidebarProvider } from '../PublicSidebarContext';
import { PublicSidebarTree } from '../PublicSidebarTree';
import type { HierarchicalGoal } from '@/lib/types';

const mockPathname = vi.fn(() => '/district/westside/goals/grand-1');

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
}));

const objectives: HierarchicalGoal[] = [
  {
    id: 'obj-1',
    district_id: 'district-1',
    plan_id: 'plan-1',
    parent_id: null,
    goal_number: '1',
    title: 'Student achievement',
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
        title: 'Reading proficiency',
        level: 1,
        order_position: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        status: 'in_progress',
        overall_progress: 72,
        children: [
          {
            id: 'grand-1',
            district_id: 'district-1',
            parent_id: 'goal-1',
            goal_number: '1.1.1',
            title: 'Phonics program',
            level: 2,
            order_position: 1,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
            status: 'on_target',
            overall_progress: 81,
            children: [],
          },
        ],
      },
    ],
  },
];

describe('PublicSidebarTree', () => {
  it('auto-expands the active lineage so third-level goals are visible', () => {
    render(
      <PublicSidebarProvider>
        <PublicSidebarTree objectives={objectives} />
      </PublicSidebarProvider>,
    );

    expect(screen.getByRole('link', { name: /1.1 reading proficiency/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /1.1.1 phonics program/i })).toBeInTheDocument();
  });

  it('keeps expand and navigation as separate controls', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    mockPathname.mockReturnValue('/district/westside/objectives/obj-1');

    render(
      <PublicSidebarProvider>
        <PublicSidebarTree objectives={objectives} />
      </PublicSidebarProvider>,
    );

    await user.click(screen.getByRole('button', { name: /collapse student achievement/i }));

    expect(screen.queryByRole('link', { name: /1.1 reading proficiency/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /student achievement/i })).toHaveAttribute(
      'href',
      '/district/westside/objectives/obj-1',
    );
  });
});
