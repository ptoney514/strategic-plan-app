import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/setup';
import userEvent from '@testing-library/user-event';
import { V2PlanEditor } from '../V2PlanEditor';

// Mock subdomain context
vi.mock('@/contexts/SubdomainContext', () => ({
  useSubdomain: () => ({ slug: 'test-org', type: 'district', hostname: 'localhost' }),
}));

// Mock useDistrict
vi.mock('@/hooks/useDistricts', () => ({
  useDistrict: () => ({
    data: { id: 'district-1', name: 'Test District', slug: 'test-org' },
    isLoading: false,
  }),
}));

// Mock plans
const mockPlans = [
  { id: 'plan-1', name: 'Strategic Plan 2025' },
  { id: 'plan-2', name: 'Draft Plan' },
];
vi.mock('@/hooks/v2/usePlans', () => ({
  usePlansBySlug: () => ({
    data: mockPlans,
    isLoading: false,
  }),
}));

// Mock goals
vi.mock('@/hooks/v2/useGoals', () => ({
  useGoalsByPlan: () => ({
    data: [
      { id: 'g1', title: 'Improve Reading', level: 0, goal_number: '1', children: [] },
      { id: 'g2', title: 'Improve Math', level: 0, goal_number: '2', children: [] },
    ],
    isLoading: false,
  }),
  useCreateGoal: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateGoal: () => ({
    mutate: vi.fn(),
  }),
  useDeleteGoal: () => ({
    mutate: vi.fn(),
  }),
}));

describe('V2PlanEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Plans & Goals heading', () => {
    render(<V2PlanEditor />);

    expect(screen.getByText('Plans & Goals')).toBeInTheDocument();
  });

  it('renders Add Objective button', () => {
    render(<V2PlanEditor />);

    expect(screen.getByText('Add Objective')).toBeInTheDocument();
  });

  it('renders goal tree items', () => {
    render(<V2PlanEditor />);

    expect(screen.getByText('Improve Reading')).toBeInTheDocument();
    expect(screen.getByText('Improve Math')).toBeInTheDocument();
  });

  it('shows plan selector when multiple plans exist', () => {
    render(<V2PlanEditor />);

    // With 2 plans, a select element should contain both plan names
    const selects = screen.getAllByRole('combobox');
    const planSelect = selects.find(
      (s) => s.querySelector('option[value="plan-1"]') !== null,
    );
    expect(planSelect).toBeDefined();
  });

  it('shows plan names in selector', () => {
    render(<V2PlanEditor />);

    expect(screen.getByText('Strategic Plan 2025')).toBeInTheDocument();
    expect(screen.getByText('Draft Plan')).toBeInTheDocument();
  });

  it('shows Add Objective inline form when button is clicked', async () => {
    const user = userEvent.setup();
    render(<V2PlanEditor />);

    await user.click(screen.getByText('Add Objective'));

    expect(screen.getByPlaceholderText(/new objective title/i)).toBeInTheDocument();
  });

  it('renders goal level badges', () => {
    render(<V2PlanEditor />);

    const badges = screen.getAllByText('L0');
    expect(badges).toHaveLength(2);
  });

  it('renders goal numbers', () => {
    render(<V2PlanEditor />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
