import { Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { GoalCardWithMetrics } from '../public';

interface GoalCardViewProps {
  goal: Goal;
  metrics: Metric[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  showMetricsContent: boolean;
  editingMetricId?: string | null;
  onEditMetric?: (metricId: string) => void;
  onSaveMetric?: (metricId: string, updates: Partial<Metric>) => Promise<void>;
  onCancelEditMetric?: () => void;
}

/**
 * GoalCardView - Read-only view of a goal card with hover-to-reveal edit buttons
 * Follows the same pattern as HeaderSection for consistency
 */
export function GoalCardView({
  goal,
  metrics,
  isExpanded,
  onToggleExpand,
  onEdit,
  showMetricsContent,
  editingMetricId,
  onEditMetric,
  onSaveMetric,
  onCancelEditMetric,
}: GoalCardViewProps) {
  const hasMetrics = metrics.length > 0;

  return (
    <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden group relative">
      {/* Goal Header */}
      <div className="relative">
        <button
          onClick={() => hasMetrics && onToggleExpand()}
          className={`w-full px-5 py-4 text-left transition-colors ${
            hasMetrics ? 'hover:bg-[#fafaf8] cursor-pointer' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Number Badge */}
            <div className="w-10 h-10 rounded-full bg-[#f5f3ef] flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-semibold text-[#4a4a4a]">
                {goal.goal_number}
              </span>
            </div>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-[#1a1a1a] mb-1">
                {goal.title}
              </div>
              {goal.description && (
                <p className="text-[13px] text-[#6a6a6a] line-clamp-2">
                  {goal.description}
                </p>
              )}
            </div>

            {/* Status Badge */}
            {goal.indicator_text && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-[#e8e6e1] rounded-md flex-shrink-0">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: goal.indicator_color || '#6b8f71' }}
                />
                <span className="text-[12px] font-semibold text-[#4a4a4a] uppercase">
                  {goal.indicator_text}
                </span>
              </div>
            )}

            {/* Expand/Collapse Chevron */}
            {hasMetrics && (
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[#8a8a8a]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8a8a8a]" />
                )}
              </div>
            )}
          </div>
        </button>

        {/* Hover-to-reveal Edit Button - Top Right Corner */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#6a6a6a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-[#fafaf8] hover:text-[#1a1a1a] hover:border-[#d4d1cb] shadow-sm"
          title="Edit goal"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {/* Expanded Metrics Section */}
      {showMetricsContent && isExpanded && hasMetrics && (
        <div className="border-t border-[#e8e6e1] bg-[#fafaf8] p-3">
          <GoalCardWithMetrics
            goal={goal}
            metrics={metrics}
            hideHeader={true}
            editingMetricId={editingMetricId}
            onEditMetric={onEditMetric}
            onSaveMetric={onSaveMetric}
            onCancelEditMetric={onCancelEditMetric}
          />
        </div>
      )}
    </div>
  );
}
