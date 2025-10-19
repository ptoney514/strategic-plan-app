import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Target, BarChart3 } from 'lucide-react';
import type { Goal } from '../../lib/types';

interface GoalsTreePanelProps {
  goals: Goal[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string) => void;
  searchQuery: string;
}

export function GoalsTreePanel({ goals, selectedGoalId, onSelectGoal, searchQuery }: GoalsTreePanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (goalId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedIds(newExpanded);
  };

  const filterGoals = (goals: Goal[], query: string): Goal[] => {
    if (!query.trim()) return goals;

    const lowerQuery = query.toLowerCase();
    return goals.filter(goal => {
      const matchesSearch =
        goal.title.toLowerCase().includes(lowerQuery) ||
        goal.goal_number.toLowerCase().includes(lowerQuery) ||
        goal.description?.toLowerCase().includes(lowerQuery);

      const hasMatchingChildren = goal.children?.some(child =>
        filterGoals([child], query).length > 0
      );

      return matchesSearch || hasMatchingChildren;
    });
  };

  const filteredGoals = filterGoals(goals, searchQuery);

  return (
    <div className="w-96 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Strategic Objectives</h2>
        <p className="text-xs text-gray-500 mt-1">Click an objective to see its roll-up metrics</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredGoals.length === 0 ? (
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'No objectives found' : 'No objectives created yet'}
            </p>
          </div>
        ) : (
          <div>
            {filteredGoals.map(goal => (
              <GoalTreeNode
                key={goal.id}
                goal={goal}
                level={0}
                isExpanded={expandedIds.has(goal.id)}
                isSelected={selectedGoalId === goal.id}
                onToggle={() => toggleExpand(goal.id)}
                onSelect={() => onSelectGoal(goal.id)}
                expandedIds={expandedIds}
                selectedGoalId={selectedGoalId}
                onSelectGoal={onSelectGoal}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface GoalTreeNodeProps {
  goal: Goal;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  expandedIds: Set<string>;
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string) => void;
  onToggleExpand: (goalId: string) => void;
}

function GoalTreeNode({
  goal,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  expandedIds,
  selectedGoalId,
  onSelectGoal,
  onToggleExpand
}: GoalTreeNodeProps) {
  const hasChildren = goal.children && goal.children.length > 0;
  const paddingLeft = level === 0 ? 16 : level * 24 + 16;

  // Count metrics for this goal
  const metricsCount = goal.metrics?.length || 0;

  return (
    <>
      <div
        className={`
          group relative flex items-center gap-3 py-3 px-4 cursor-pointer transition-all
          border-l-3
          ${isSelected
            ? 'bg-blue-50 border-l-blue-600 hover:bg-blue-50'
            : 'border-l-transparent hover:bg-gray-50 hover:border-l-gray-300'
          }
          ${level === 0 ? 'py-4' : ''}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={onSelect}
      >
        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
        {!hasChildren && level > 0 && <div className="w-6 flex-shrink-0" />}

        {/* Goal Icon for strategic objectives */}
        {level === 0 && (
          <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Target className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
          </div>
        )}

        {/* Goal Number & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`
              font-semibold flex-shrink-0
              ${level === 0 ? 'text-base' : 'text-sm'}
              ${isSelected ? 'text-blue-900' : 'text-gray-800'}
            `}>
              {goal.goal_number}
            </span>
            <span className={`
              truncate
              ${level === 0 ? 'text-sm' : 'text-sm'}
              ${isSelected ? 'text-blue-800' : 'text-gray-600'}
            `}>
              {goal.title}
            </span>
          </div>

          {/* Metrics count badge */}
          {metricsCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <BarChart3 className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {metricsCount} metric{metricsCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {goal.indicator_text && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: goal.indicator_color || '#10b981' }}
            title={goal.indicator_text}
          />
        )}
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div>
          {goal.children!.map(child => (
            <GoalTreeNode
              key={child.id}
              goal={child}
              level={level + 1}
              isExpanded={expandedIds.has(child.id)}
              isSelected={selectedGoalId === child.id}
              onToggle={() => onToggleExpand(child.id)}
              onSelect={() => onSelectGoal(child.id)}
              expandedIds={expandedIds}
              selectedGoalId={selectedGoalId}
              onSelectGoal={onSelectGoal}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
}
