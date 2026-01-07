import { Edit2, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { GoalCardWithMetrics } from '../public';

interface GoalCardViewProps {
  goal: Goal;
  metrics: Metric[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onEditMetrics: () => void;
  showMetricsContent: boolean;
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
  onEditMetrics,
  showMetricsContent,
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

            {/* Metrics Count + Expand/Collapse */}
            {hasMetrics && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f3ef] rounded-md">
                  <BarChart3 className="h-3.5 w-3.5 text-[#6a6a6a]" />
                  <span className="text-[12px] font-medium text-[#6a6a6a]">
                    {metrics.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[#8a8a8a]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#8a8a8a]" />
                )}
              </div>
            )}
          </div>
        </button>

        {/* Hover-to-reveal Edit Buttons - Top Right Corner */}
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditMetrics();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#6a6a6a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-[#fafaf8] hover:text-[#1a1a1a] hover:border-[#d4d1cb] shadow-sm"
            title="Edit metrics"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Metrics
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#6a6a6a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-[#fafaf8] hover:text-[#1a1a1a] hover:border-[#d4d1cb] shadow-sm"
            title="Edit goal"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Expanded Metrics Section */}
      {showMetricsContent && isExpanded && hasMetrics && (
        <div className="border-t border-[#e8e6e1] bg-[#fafaf8] p-3">
          <GoalCardWithMetrics
            goal={goal}
            metrics={metrics}
            hideHeader={true}
          />
        </div>
      )}
    </div>
  );
}
