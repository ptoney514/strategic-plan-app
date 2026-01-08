import type { Goal, Metric } from '../../lib/types';
import { GoalCardView } from './GoalCardView';
import { GoalEditForm } from './GoalEditForm';

interface GoalCardEditableProps {
  goal: Goal;
  metrics: Metric[];
  isExpanded: boolean;
  isEditing: boolean;
  isDimmed: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onSave: (updates: Partial<Goal>) => Promise<void>;
  onCancel: () => void;
  editingMetricId?: string | null;
  onEditMetric?: (metricId: string) => void;
  onSaveMetric?: (metricId: string, updates: Partial<Metric>) => Promise<void>;
  onCancelEditMetric?: () => void;
}

/**
 * GoalCardEditable - Wrapper component that switches between view and edit modes
 * Follows the same pattern as HeaderSection for consistency
 */
export function GoalCardEditable({
  goal,
  metrics,
  isExpanded,
  isEditing,
  isDimmed,
  onToggleExpand,
  onEdit,
  onSave,
  onCancel,
  editingMetricId,
  onEditMetric,
  onSaveMetric,
  onCancelEditMetric,
}: GoalCardEditableProps) {
  // Apply dimming when other sections are being edited
  const containerClasses = `transition-opacity ${isDimmed ? 'opacity-60 pointer-events-none' : ''}`;

  return (
    <div className={containerClasses}>
      {isEditing ? (
        <GoalEditForm
          goal={goal}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : (
        <GoalCardView
          goal={goal}
          metrics={metrics}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          showMetricsContent={!isDimmed} // Hide metrics content when dimmed
          editingMetricId={editingMetricId}
          onEditMetric={onEditMetric}
          onSaveMetric={onSaveMetric}
          onCancelEditMetric={onCancelEditMetric}
        />
      )}
    </div>
  );
}
