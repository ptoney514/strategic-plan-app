import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/setup';
import { SubdomainOverrideProvider } from '@/contexts/SubdomainContext';
import { ObjectivesOverviewView } from '../ObjectivesOverviewView';

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
  usePathname: () => '/objectives',
}));

const mockUsePlansBySlug = vi.fn();
vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: (...args: unknown[]) => mockUsePlansBySlug(...args),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: (...args: unknown[]) => mockUseGoalsByPlan(...args),
}));

const objectives = [
  { id: 'obj-1', goal_number: '1', title: 'Obj 1', level: 0, status: 'on_target', children: [] },
];

describe('ObjectivesOverviewView — link construction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlansBySlug.mockReturnValue({
      data: [{ id: 'plan-1', is_active: true, is_public: true, updated_at: '2026-04-01' }],
      isLoading: false,
    });
    mockUseGoalsByPlan.mockReturnValue({ data: objectives, isLoading: false });
  });

  it('breadcrumb and any rendered hrefs never start with /district/', () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <ObjectivesOverviewView />
      </SubdomainOverrideProvider>,
    );

    const links = screen.queryAllByRole('link');
    const badLinks = links
      .map((a) => a.getAttribute('href'))
      .filter((href): href is string => !!href && href.startsWith('/district/'));

    expect(badLinks).toEqual([]);
  });

  it('card click routes with a bare (jsdom query-param) path', () => {
    render(
      <SubdomainOverrideProvider slug="westside">
        <ObjectivesOverviewView />
      </SubdomainOverrideProvider>,
    );

    screen.getByTestId('objectives-overview-card-1').click();
    expect(mockPush).toHaveBeenCalledWith('/objectives/obj-1?subdomain=westside');
  });
});
