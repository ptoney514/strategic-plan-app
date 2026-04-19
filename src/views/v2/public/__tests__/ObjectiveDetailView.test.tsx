import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import { ObjectiveDetailView } from '../ObjectiveDetailView';
import type { HierarchicalGoal } from '@/lib/types';

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
  useDistrictLink: () => (p: string) => `${p}?subdomain=westside`,
}));

vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: [{ id: 'plan-1', is_active: true, is_public: true }],
    isLoading: false,
  }),
}));

const mockUseGoalsByPlan = vi.fn();
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: () => mockUseGoalsByPlan(),
}));

const mockUseWidgetsByGoals = vi.fn();
vi.mock('@/hooks/v2/useWidgets', () => ({
  useWidgetsByGoals: () => mockUseWidgetsByGoals(),
}));

const BASE_FIELDS = {
  district_id: 'district-1',
  order_position: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

function buildGoals(objStatus: string): HierarchicalGoal[] {
  return [
    {
      ...BASE_FIELDS,
      id: 'obj-1',
      parent_id: null,
      goal_number: '1',
      title: 'Student Achievement & Well-being',
      description: 'Every student, every school.',
      level: 0,
      status: objStatus,
      overall_progress: 68,
      children: [
        {
          ...BASE_FIELDS,
          id: 'goal-1',
          parent_id: 'obj-1',
          goal_number: '1.1',
          title: 'ELA/Reading Proficiency',
          level: 1,
          status: 'in_progress',
          overall_progress: 72,
          children: [],
        },
        {
          ...BASE_FIELDS,
          id: 'goal-2',
          parent_id: 'obj-1',
          goal_number: '1.2',
          title: 'Mathematics Achievement',
          level: 1,
          status: 'on_target',
          overall_progress: 65,
          children: [],
        },
      ],
    },
  ];
}

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
    },
    position: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

function renderWithStatus(status: string) {
  mockUseGoalsByPlan.mockReturnValue({
    data: buildGoals(status),
    isLoading: false,
  });
  mockUseWidgetsByGoals.mockReturnValue({
    data: widgets,
    isLoading: false,
  });
  return render(<ObjectiveDetailView />);
}

describe('ObjectiveDetailView — narrative-left / data-right layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the breadcrumb', () => {
    renderWithStatus('in_progress');
    expect(
      screen.getByText('Student Achievement & Well-being')
    ).toBeInTheDocument();
  });

  it('renders the .obj-wm watermark with zero-padded number', () => {
    const { container } = renderWithStatus('in_progress');
    const wm = container.querySelector('.obj-wm');
    expect(wm).toBeInTheDocument();
    expect(wm).toHaveTextContent('01');
  });

  it('renders the 12-col grid container', () => {
    const { container } = renderWithStatus('in_progress');
    const grid = container.querySelector('[data-testid="objective-detail-grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('md:grid-cols-12');
  });

  it('renders the left narrative column with the Obj 01 eyebrow', () => {
    renderWithStatus('in_progress');
    expect(screen.getByText('OBJECTIVE 01')).toBeInTheDocument();
  });

  it('renders the Obj 01 serif title with italic emphasis word', () => {
    const { container } = renderWithStatus('in_progress');
    const em = container.querySelector('h2 em');
    expect(em).toBeInTheDocument();
    expect(em).toHaveTextContent('Well-being.');
  });

  it('renders the fixture narrative paragraph', () => {
    renderWithStatus('in_progress');
    expect(
      screen.getByText(/Every student, every school/)
    ).toBeInTheDocument();
  });

  it('renders the fixture pull quote and attribution', () => {
    renderWithStatus('in_progress');
    expect(
      screen.getByText(/Kindergarten teachers flag it in week three/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ms\. Alvarez, K-5 Literacy Coach/)
    ).toBeInTheDocument();
  });

  it('renders three stat callouts with the fixture labels', () => {
    renderWithStatus('in_progress');
    expect(screen.getByText('reading proficiency')).toBeInTheDocument();
    expect(screen.getByText('growth mindset score')).toBeInTheDocument();
    expect(
      screen.getByText('NDE AQuESTT, 2nd yr running')
    ).toBeInTheDocument();
  });

  it('renders a SignatureMetricCard in the right column', () => {
    const { container } = renderWithStatus('in_progress');
    expect(container.querySelector('.sig-card')).toBeInTheDocument();
  });

  it('renders one AccordionGoalRow per child goal', () => {
    const { container } = renderWithStatus('in_progress');
    expect(container.querySelectorAll('.subgoal-row')).toHaveLength(2);
  });

  it('opens the first accordion row by default when children.length <= 3', () => {
    const { container } = renderWithStatus('in_progress');
    const firstRow = container.querySelectorAll('.subgoal-row')[0];
    expect(firstRow).toHaveClass('open');
  });

  it('does NOT render the Goal Health Summary strip', () => {
    renderWithStatus('in_progress');
    expect(screen.queryByText(/Goal Health Summary/i)).toBeNull();
  });

  it('does NOT render the PDF export pill', () => {
    renderWithStatus('in_progress');
    expect(screen.queryByText(/PDF export/i)).toBeNull();
  });

  it('does NOT render 0-100% progress bars (no .progress-fill)', () => {
    const { container } = renderWithStatus('in_progress');
    expect(container.querySelector('.progress-fill')).toBeNull();
    expect(container.querySelector('.progress-track')).toBeNull();
  });

  it('does NOT render the old 2-col xl:grid-cols-2 metric grid', () => {
    const { container } = renderWithStatus('in_progress');
    expect(
      container.querySelector('[data-testid="objective-detail-goal-grid"]')
    ).toBeNull();
  });
});

describe('ObjectiveDetailView — honest framing band', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does NOT render the band when objective is on target', () => {
    renderWithStatus('on_target');
    expect(
      screen.queryByTestId('honest-framing-band')
    ).toBeNull();
  });

  it('does NOT render the band when objective is in progress', () => {
    renderWithStatus('in_progress');
    expect(
      screen.queryByTestId('honest-framing-band')
    ).toBeNull();
  });

  it('renders the band (Obj 04 fixture) only when status is off_track AND fixture has honestFraming', () => {
    // Obj 01 fixture has NO honestFraming block, so even off_track should not show it.
    // Confirm the gate requires BOTH status + fixture content.
    renderWithStatus('off_track');
    expect(
      screen.queryByTestId('honest-framing-band')
    ).toBeNull();
  });
});

describe('ObjectiveDetailView — honest framing appears for Obj 04 fixture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the band when status=off_track and goal_number=4', () => {
    mockUseGoalsByPlan.mockReturnValue({
      data: [
        {
          ...BASE_FIELDS,
          id: 'obj-1',
          parent_id: null,
          goal_number: '4',
          title: 'Finance, Safety & Infrastructure',
          level: 0,
          status: 'off_track',
          overall_progress: 45,
          children: [],
        },
      ],
      isLoading: false,
    });
    mockUseWidgetsByGoals.mockReturnValue({ data: [], isLoading: false });

    render(<ObjectiveDetailView />);

    expect(screen.getByTestId('honest-framing-band')).toBeInTheDocument();
    expect(screen.getByText('The problem')).toBeInTheDocument();
    expect(screen.getByText("What we're doing")).toBeInTheDocument();
    expect(screen.getByText("When you'll see change")).toBeInTheDocument();
  });
});

describe('ObjectiveDetailView — link safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no rendered anchor href starts with /district/', () => {
    renderWithStatus('in_progress');

    const badLinks = screen
      .queryAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .filter((href): href is string => !!href && href.startsWith('/district/'));

    expect(badLinks).toEqual([]);
  });
});
