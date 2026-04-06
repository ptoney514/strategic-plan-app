import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import type { MouseEvent, ReactNode } from 'react';
import { render, screen, within } from '@/test/setup';
import { PublicSidebarLayout } from '../PublicSidebarLayout';
import type { HierarchicalGoal } from '@/lib/types';

let mockPathname = '/district/westside';
const mockToggleTheme = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: ReactNode;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
    [key: string]: unknown;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...(props as object)}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'westside', type: 'district' }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    toggle: mockToggleTheme,
  }),
}));

vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: {
      id: 'district-1',
      name: 'Westside Community Schools',
      logo_url: null,
      primary_color: '#702ae1',
    },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [
      {
        id: 'plan-1',
        is_active: true,
        is_public: true,
        start_date: '2025-07-01',
        end_date: '2027-06-30',
        updated_at: '2026-04-01T00:00:00Z',
      },
    ],
    isLoading: false,
  }),
}));

const goals: HierarchicalGoal[] = [
  {
    id: 'objective-1',
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
        plan_id: 'plan-1',
        parent_id: 'objective-1',
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
            id: 'goal-grand',
            district_id: 'district-1',
            plan_id: 'plan-1',
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

vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: () => ({
    data: goals,
    isLoading: false,
  }),
}));

describe('PublicSidebarLayout', () => {
  beforeEach(() => {
    mockPathname = '/district/westside';
    mockToggleTheme.mockReset();
    document.body.style.overflow = '';
    window.location.hash = '';
  });

  it('opens the mobile sheet from the hamburger button and closes from the sheet control', async () => {
    const user = userEvent.setup();

    render(
      <PublicSidebarLayout>
        <div>Explorer content</div>
      </PublicSidebarLayout>,
    );

    const menuButton = screen.getByTestId('public-mobile-menu-button');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);

    const dialog = screen.getByRole('dialog', { name: /public navigation menu/i });
    expect(dialog).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByTestId('public-mobile-menu-button')).toHaveAttribute('aria-expanded', 'true');

    await user.click(within(dialog).getByRole('button', { name: /close navigation menu/i }));

    expect(screen.queryByRole('dialog', { name: /public navigation menu/i })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('uses lg breakpoints for the public explorer shell', () => {
    render(
      <PublicSidebarLayout>
        <div>Explorer content</div>
      </PublicSidebarLayout>,
    );

    expect(screen.getByTestId('public-desktop-sidebar').className).toContain('hidden');
    expect(screen.getByTestId('public-desktop-sidebar').className).toContain('lg:block');
    expect(screen.getByTestId('public-mobile-topbar').className).toContain('lg:hidden');
    expect(screen.getByTestId('public-main-content').className).toContain('lg:ml-80');
  });

  it('closes the mobile sheet when the overlay is pressed', async () => {
    const user = userEvent.setup();

    render(
      <PublicSidebarLayout>
        <div>Explorer content</div>
      </PublicSidebarLayout>,
    );

    await user.click(screen.getByTestId('public-mobile-menu-button'));
    expect(screen.getByRole('dialog', { name: /public navigation menu/i })).toBeInTheDocument();

    await user.click(screen.getByTestId('public-mobile-overlay'));

    expect(screen.queryByRole('dialog', { name: /public navigation menu/i })).not.toBeInTheDocument();
  });

  it('closes the mobile sheet when a navigation link is selected', async () => {
    const user = userEvent.setup();

    render(
      <PublicSidebarLayout>
        <div>Explorer content</div>
      </PublicSidebarLayout>,
    );

    await user.click(screen.getByTestId('public-mobile-menu-button'));
    const dialog = screen.getByRole('dialog', { name: /public navigation menu/i });

    await user.click(within(dialog).getByRole('link', { name: /plan health/i }));

    expect(screen.queryByRole('dialog', { name: /public navigation menu/i })).not.toBeInTheDocument();
  });

  it('keeps the active goal lineage visible inside the mobile explorer sheet', async () => {
    const user = userEvent.setup();
    mockPathname = '/district/westside/goals/goal-grand';

    render(
      <PublicSidebarLayout>
        <div>Explorer content</div>
      </PublicSidebarLayout>,
    );

    await user.click(screen.getByTestId('public-mobile-menu-button'));
    const dialog = screen.getByRole('dialog', { name: /public navigation menu/i });

    expect(within(dialog).getByRole('link', { name: /1.1 reading proficiency/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /1.1.1 phonics program/i })).toBeInTheDocument();
    expect(within(dialog).queryByRole('link', { name: /settings/i })).not.toBeInTheDocument();
  });
});
