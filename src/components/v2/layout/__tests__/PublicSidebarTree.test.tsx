import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { SubdomainOverrideProvider } from '@/contexts/SubdomainContext';
import { PublicSidebarProvider } from '../PublicSidebarContext';
import { PublicSidebarTree } from '../PublicSidebarTree';
import type { HierarchicalGoal } from '@/lib/types';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const BASE: Pick<
  HierarchicalGoal,
  'district_id' | 'parent_id' | 'order_position' | 'created_at' | 'updated_at'
> = {
  district_id: 'd-1',
  parent_id: null,
  order_position: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const objectives: HierarchicalGoal[] = [
  {
    ...BASE,
    id: 'obj-1',
    goal_number: '1',
    title: 'Student Achievement & Well-being',
    level: 0,
    status: 'on_target',
    overall_progress: 72,
    children: [
      {
        ...BASE,
        id: 'g-1a',
        parent_id: 'obj-1',
        goal_number: '1.1',
        title: 'Sense of belonging',
        level: 1,
        status: 'on_target',
        overall_progress: 80,
        children: [],
      },
    ],
  },
];

describe('PublicSidebarTree — link construction', () => {
  it('does not render any anchor href prefixed with /district/', () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <PublicSidebarProvider>
          <PublicSidebarTree objectives={objectives} />
        </PublicSidebarProvider>
      </SubdomainOverrideProvider>,
    );

    const links = screen.getAllByRole('link');
    const badLinks = links
      .map((a) => a.getAttribute('href'))
      .filter((href): href is string => !!href && href.startsWith('/district/'));

    expect(badLinks).toEqual([]);
  });

  it('renders the objective link with a jsdom query-param href (subdomain simulation)', () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <PublicSidebarProvider>
          <PublicSidebarTree objectives={objectives} />
        </PublicSidebarProvider>
      </SubdomainOverrideProvider>,
    );

    const links = screen.getAllByRole('link');
    const hrefs = links.map((a) => a.getAttribute('href'));
    // On jsdom (localhost), useDistrictLink appends ?subdomain=westside.
    expect(hrefs).toContain('/objectives/obj-1?subdomain=westside');
  });
});
