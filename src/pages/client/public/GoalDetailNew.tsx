import { useMemo } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useGoal, useChildGoals } from '../../../hooks/useGoals';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import { GoalHeader } from '../../../components/public/GoalHeader';
import { MetricsGrid } from '../../../components/public/MetricsGrid';
import { InitiativeRow } from '../../../components/public/InitiativeRow';
import type { District, Goal } from '../../../lib/types';

interface GoalDetailContext {
  district: District;
  objectives: Goal[];
  goals: Goal[];
}

export function GoalDetailNew() {
  const { goalId } = useParams<{ goalId: string }>();
  const context = useOutletContext<GoalDetailContext>();

  const { data: goal, isLoading: goalLoading } = useGoal(goalId!);
  const { data: childGoals, isLoading: childrenLoading } = useChildGoals(goalId!);

  // Fetch all metrics for the district to support both current goal and child goals
  const districtId = context?.district?.id;
  const { data: districtMetrics, isLoading: metricsLoading } = useMetricsByDistrict(districtId || '');

  const isLoading = goalLoading || metricsLoading || childrenLoading;

  // Find parent objective for breadcrumbs and color
  const parentObjective = context?.goals?.find(g => g.id === goal?.parent_id);

  // Get all goal IDs in this subtree (current goal + all children)
  const relevantGoalIds = useMemo(() => {
    const ids = new Set<string>();
    if (goalId) ids.add(goalId);
    childGoals?.forEach(child => ids.add(child.id));
    return ids;
  }, [goalId, childGoals]);

  // Filter district metrics to only those belonging to this goal tree
  const allMetrics = useMemo(() => {
    if (!districtMetrics) return [];
    return districtMetrics.filter(m => relevantGoalIds.has(m.goal_id));
  }, [districtMetrics, relevantGoalIds]);

  // Metrics for the current goal only (for MetricsGrid header display)
  const currentGoalMetrics = useMemo(() => {
    if (!goalId || !districtMetrics) return [];
    return districtMetrics.filter(m => m.goal_id === goalId);
  }, [goalId, districtMetrics]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-12">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg" />
            <div className="flex-1">
              <div className="h-8 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 h-80">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-16 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">Goal not found</p>
      </div>
    );
  }

  // Get Level 2 initiatives (children of this goal)
  const initiatives = childGoals?.filter(g => g.level === 2) || [];

  return (
    <div>
      {/* Goal Header */}
      <GoalHeader goal={goal} parentObjective={parentObjective} />

      {/* Metrics Grid - shows metrics for current goal */}
      <MetricsGrid metrics={currentGoalMetrics} />

      {/* Initiatives Section */}
      {initiatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
            <h2 className="font-display font-medium text-lg text-gray-900">
              Sub-Goals
            </h2>
            <div className="text-xs text-gray-400 font-medium">
              {initiatives.length} sub-goal{initiatives.length !== 1 ? 's' : ''}
            </div>
          </div>

          {initiatives.map(initiative => (
            <InitiativeRow
              key={initiative.id}
              initiative={initiative}
              metrics={allMetrics}
            />
          ))}
        </div>
      )}

      {/* Child Goals Section (for Level 0 objectives showing Level 1 goals) */}
      {goal.level === 0 && childGoals && childGoals.length > 0 && (
        <div className="space-y-4 mt-12">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
            <h2 className="font-display font-medium text-lg text-gray-900">
              Strategic Goals
            </h2>
            <div className="text-xs text-gray-400 font-medium">
              {childGoals.length} goal{childGoals.length !== 1 ? 's' : ''}
            </div>
          </div>

          {childGoals.map(childGoal => (
            <InitiativeRow
              key={childGoal.id}
              initiative={childGoal}
              metrics={allMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
