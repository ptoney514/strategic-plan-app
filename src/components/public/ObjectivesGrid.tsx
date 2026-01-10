import type { Goal, Metric } from '../../lib/types';
import { ObjectiveCard } from './ObjectiveCard';

interface ObjectivesGridProps {
  objectives: Goal[];
  goals: Goal[];
  metrics: Metric[];
}

export function ObjectivesGrid({ objectives, goals, metrics }: ObjectivesGridProps) {
  // Get child goals for each objective
  const getChildGoals = (objectiveId: string) => {
    return goals.filter(g => g.parent_id === objectiveId);
  };

  if (objectives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No strategic objectives found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {objectives.map((objective, index) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          childGoals={getChildGoals(objective.id)}
          metrics={metrics}
          index={index}
        />
      ))}
    </div>
  );
}
