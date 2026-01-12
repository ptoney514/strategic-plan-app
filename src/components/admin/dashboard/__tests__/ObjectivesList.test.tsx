import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test/setup';
import { ObjectivesList, PublishStatusBadge } from '../ObjectivesList';
import type { Goal } from '../../../../lib/types';

const mockObjectives: Goal[] = [
  {
    id: 'obj-1',
    district_id: 'dist-1',
    parent_id: null,
    goal_number: '1',
    title: 'Student Achievement',
    level: 0,
    order_position: 0,
    is_public: true,
    color: 'blue',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'obj-2',
    district_id: 'dist-1',
    parent_id: null,
    goal_number: '2',
    title: 'Teacher Excellence',
    level: 0,
    order_position: 1,
    is_public: false,
    color: 'green',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('ObjectivesList', () => {
  it('renders objectives list heading', () => {
    render(<ObjectivesList objectives={mockObjectives} basePath="/test/admin" />);
    expect(screen.getByText('Objectives')).toBeInTheDocument();
  });

  it('renders View All link', () => {
    render(<ObjectivesList objectives={mockObjectives} basePath="/test/admin" />);
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('renders all objective titles', () => {
    render(<ObjectivesList objectives={mockObjectives} basePath="/test/admin" />);
    expect(screen.getByText('Student Achievement')).toBeInTheDocument();
    expect(screen.getByText('Teacher Excellence')).toBeInTheDocument();
  });

  it('renders goal numbers', () => {
    render(<ObjectivesList objectives={mockObjectives} basePath="/test/admin" />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows Published badge for public objectives', () => {
    render(<ObjectivesList objectives={mockObjectives} basePath="/test/admin" />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('shows Draft badge for non-public objectives', () => {
    render(<ObjectivesList objectives={mockObjectives} basePath="/test/admin" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows empty state when no objectives', () => {
    render(<ObjectivesList objectives={[]} basePath="/test/admin" />);
    expect(screen.getByText('No objectives yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first objective')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<ObjectivesList objectives={[]} basePath="/test/admin" isLoading={true} />);
    expect(screen.getByText('Objectives')).toBeInTheDocument();
    // Should not show empty state when loading
    expect(screen.queryByText('No objectives yet')).not.toBeInTheDocument();
  });

  it('shows "+N more objectives" link when more than 5 objectives', () => {
    const manyObjectives: Goal[] = Array.from({ length: 7 }, (_, i) => ({
      id: `obj-${i + 1}`,
      district_id: 'dist-1',
      parent_id: null,
      goal_number: `${i + 1}`,
      title: `Objective ${i + 1}`,
      level: 0 as const,
      order_position: i,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }));

    render(<ObjectivesList objectives={manyObjectives} basePath="/test/admin" />);
    expect(screen.getByText('+2 more objectives')).toBeInTheDocument();
  });

  it('only shows first 5 objectives', () => {
    const manyObjectives: Goal[] = Array.from({ length: 7 }, (_, i) => ({
      id: `obj-${i + 1}`,
      district_id: 'dist-1',
      parent_id: null,
      goal_number: `${i + 1}`,
      title: `Objective ${i + 1}`,
      level: 0 as const,
      order_position: i,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }));

    render(<ObjectivesList objectives={manyObjectives} basePath="/test/admin" />);
    expect(screen.getByText('Objective 1')).toBeInTheDocument();
    expect(screen.getByText('Objective 5')).toBeInTheDocument();
    expect(screen.queryByText('Objective 6')).not.toBeInTheDocument();
  });
});

describe('PublishStatusBadge', () => {
  it('shows Published when isPublished is true', () => {
    render(<PublishStatusBadge isPublished={true} />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('shows Draft when isPublished is false', () => {
    render(<PublishStatusBadge isPublished={false} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Draft when isPublished is undefined', () => {
    render(<PublishStatusBadge />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('has correct styling for Published badge', () => {
    render(<PublishStatusBadge isPublished={true} />);
    const badge = screen.getByText('Published');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('has correct styling for Draft badge', () => {
    render(<PublishStatusBadge isPublished={false} />);
    const badge = screen.getByText('Draft');
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-800');
  });
});
