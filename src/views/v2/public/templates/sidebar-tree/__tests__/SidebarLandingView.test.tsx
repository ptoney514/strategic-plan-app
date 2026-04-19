import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import { SubdomainOverrideProvider } from '@/contexts/SubdomainContext';
import { SidebarLandingView } from '../SidebarLandingView';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: vi.fn().mockReturnValue(''),
  }),
  usePathname: () => '/',
}));

vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'org-1', name: 'Westside', primary_color: '#1e3a5f' },
    isLoading: false,
  }),
}));

const mockUsePlansBySlug = vi.fn();
vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const mockObjectives = [
  {
    id: 'obj-1',
    goal_number: '1',
    title: 'Student Achievement & Well-being',
    description: 'Objective 1',
    overall_progress: 72,
    level: 0,
    status: 'on_target',
    children: [
      { id: 'g-1a', goal_number: '1.1', title: 'Goal 1.1', level: 1, status: 'on_target' },
      { id: 'g-1b', goal_number: '1.2', title: 'Goal 1.2', level: 1, status: 'at_risk' },
    ],
  },
];

describe('SidebarLandingView — link construction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlansBySlug.mockReturnValue({
      data: [{
        id: 'plan-1',
        name: 'Strategic Plan 2025',
        is_active: true,
        is_public: true,
        start_date: '2021-09-01',
        end_date: '2026-08-31',
        updated_at: '2026-04-01',
        description: 'Plan description',
      }],
      isLoading: false,
    });
    mockUseGoalsByPlan.mockReturnValue({ data: mockObjectives, isLoading: false });
  });

  it('does not render any anchor href prefixed with /district/', () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <SidebarLandingView />
      </SubdomainOverrideProvider>,
    );

    const links = screen.queryAllByRole('link');
    const badLinks = links
      .map((a) => a.getAttribute('href'))
      .filter((href): href is string => !!href && href.startsWith('/district/'));

    expect(badLinks).toEqual([]);
  });

  it('card click routes via router.push with a bare path', () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <SidebarLandingView />
      </SubdomainOverrideProvider>,
    );

    const card = screen.getByTestId('objective-card-1');
    card.click();
    // On jsdom (hostname 'localhost'), the subdomain is simulated via
    // query-param — so useDistrictLink appends ?subdomain=westside.
    expect(mockPush).toHaveBeenCalledWith('/objectives/obj-1?subdomain=westside');
  });
});
