import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Goal } from '../lib/types';

interface GoalsOutlineListProps {
  goals: Goal[];
  onGoalClick?: (goalId: string) => void;
}

export function GoalsOutlineList({ goals, onGoalClick }: GoalsOutlineListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!goals || goals.length === 0) {
    return null;
  }

  return (
    <div className="border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-100 transition-colors"
        aria-expanded={!isCollapsed}
        aria-label={`${isCollapsed ? 'Show' : 'Hide'} goals overview with ${getTotalGoalsCount(goals)} goals`}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-neutral-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-500" />
          )}
          <h4 className="text-sm font-semibold text-neutral-900">
            Goals Overview {!isCollapsed && `(${getTotalGoalsCount(goals)})`}
          </h4>
        </div>
        <span className="text-xs text-neutral-500">
          {isCollapsed ? 'Show' : 'Hide'}
        </span>
      </button>

      {/* Goals List */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-1">
          {goals.map((goal) => (
            <GoalOutlineItem
              key={goal.id}
              goal={goal}
              onGoalClick={onGoalClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GoalOutlineItemProps {
  goal: Goal;
  level?: number;
  onGoalClick?: (goalId: string) => void;
}

function GoalOutlineItem({ goal, level = 0, onGoalClick }: GoalOutlineItemProps) {
  const paddingLeft = level * 16; // 16px per level for indentation

  return (
    <div>
      {/* Goal Item */}
      <button
        onClick={() => onGoalClick?.(goal.id)}
        className="w-full text-left py-1.5 px-2 rounded hover:bg-white transition-colors group"
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
        aria-label={`Jump to goal ${goal.goal_number}: ${goal.title}`}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-emerald-600 flex-shrink-0">
            {goal.goal_number}
          </span>
          <span className="text-sm text-neutral-700 group-hover:text-neutral-900 line-clamp-1">
            {goal.title}
          </span>
        </div>
      </button>

      {/* Sub-goals (recursively render children) */}
      {goal.children && goal.children.length > 0 && (
        <div className="space-y-1">
          {goal.children.map((child) => (
            <GoalOutlineItem
              key={child.id}
              goal={child}
              level={level + 1}
              onGoalClick={onGoalClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to count total goals including nested ones
function getTotalGoalsCount(goals: Goal[]): number {
  return goals.reduce((count, goal) => {
    let total = 1; // Count this goal
    if (goal.children && goal.children.length > 0) {
      total += getTotalGoalsCount(goal.children);
    }
    return count + total;
  }, 0);
}
