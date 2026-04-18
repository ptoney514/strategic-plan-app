import type { HierarchicalGoal } from '../types';

export function findGoalLineage(
  goals: HierarchicalGoal[],
  targetId: string,
): HierarchicalGoal[] {
  for (const goal of goals) {
    if (goal.id === targetId) {
      return [goal];
    }

    const childLineage = findGoalLineage(goal.children || [], targetId);
    if (childLineage.length > 0) {
      return [goal, ...childLineage];
    }
  }

  return [];
}

export function findGoalById(
  goals: HierarchicalGoal[],
  targetId: string,
): HierarchicalGoal | undefined {
  const lineage = findGoalLineage(goals, targetId);
  return lineage[lineage.length - 1];
}
