import type { HierarchicalGoal } from '../../../lib/types';
import { GoalTreeItem } from './GoalTreeItem';

interface GoalTreeViewProps {
  goals: HierarchicalGoal[];
  planId: string;
  districtId: string;
}

export function GoalTreeView({ goals, planId, districtId }: GoalTreeViewProps) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
          No objectives yet. Add one to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
    >
      {goals.map((goal) => (
        <GoalTreeItem key={goal.id} goal={goal} planId={planId} districtId={districtId} />
      ))}
    </div>
  );
}
