import { useParams, useOutletContext, Link } from 'react-router-dom';
import { useGoal, useChildGoals } from '../../../hooks/useGoals';
import { StatusBadge, calculateStatus } from '../../../components/public/StatusBadge';
import { ChevronRight, FolderOpen } from 'lucide-react';
import type { District, Goal } from '../../../lib/types';

interface ObjectiveDetailContext {
  district: District;
  objectives: Goal[];
  goals: Goal[];
}

// Color mapping for objective header
const colorConfig = {
  red: {
    badge: 'bg-district-red',
    light: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-district-red',
  },
  blue: {
    badge: 'bg-district-blue',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-district-blue',
  },
  amber: {
    badge: 'bg-district-amber',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-district-amber',
  },
  green: {
    badge: 'bg-district-green',
    light: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-district-green',
  },
};

function getColor(goal: Goal, index: number): keyof typeof colorConfig {
  if (goal.color && goal.color in colorConfig) {
    return goal.color as keyof typeof colorConfig;
  }
  const defaultColors: (keyof typeof colorConfig)[] = ['red', 'blue', 'amber', 'green'];
  return defaultColors[index % defaultColors.length];
}

export function ObjectiveDetail() {
  const { goalId, slug } = useParams<{ goalId: string; slug: string }>();
  const context = useOutletContext<ObjectiveDetailContext>();

  const { data: objective, isLoading: objectiveLoading } = useGoal(goalId!);
  const { data: childGoals, isLoading: childrenLoading } = useChildGoals(goalId!);

  const isLoading = objectiveLoading || childrenLoading;

  // Find the objective index for color assignment
  const objectiveIndex = context?.objectives?.findIndex(o => o.id === goalId) ?? 0;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-lg" />
          <div className="flex-1">
            <div className="h-8 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-1 bg-gray-100 rounded w-24" />
          </div>
        </div>
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">Objective not found</p>
        <Link to={`/${slug}`} className="mt-4 inline-flex items-center text-district-red hover:underline">
          Return to Overview
        </Link>
      </div>
    );
  }

  const color = getColor(objective, objectiveIndex);
  const colors = colorConfig[color];
  const status = calculateStatus(objective.overall_progress);

  // Get child goals (Level 1)
  const level1Goals = childGoals?.filter(g => g.level === 1) || [];

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex text-xs text-gray-500 space-x-2 items-center">
        <Link to={`/${slug}`} className="hover:text-gray-900 transition-colors">
          Strategic Plan
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{objective.title}</span>
      </nav>

      {/* Header with Number Badge and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-lg ${colors.badge} text-white flex items-center justify-center font-display font-semibold text-xl lg:text-2xl shadow-sm flex-shrink-0`}
        >
          {objective.goal_number}
        </div>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-display font-semibold text-2xl lg:text-3xl text-gray-900 tracking-tight">
              {objective.title}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
            {objective.description || objective.executive_summary ||
              `This strategic objective encompasses our commitment to excellence and continuous improvement.`}
          </p>
        </div>
      </div>

      {/* Goals Section */}
      {level1Goals.length > 0 && (
        <div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
            <h2 className="font-display font-medium text-lg text-gray-900">
              Goals
            </h2>
            <div className="text-xs text-gray-400 font-medium">
              {level1Goals.length} goal{level1Goals.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-3">
            {level1Goals.map(goal => {
              const goalStatus = calculateStatus(goal.overall_progress);

              return (
                <Link
                  key={goal.id}
                  to={`/${slug}/goal/${goal.id}`}
                  className="group block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    {/* Number badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center bg-gray-50 text-xs font-bold text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700 transition-colors">
                      {goal.goal_number}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-district-red transition-colors">
                        {goal.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {goal.description || goal.executive_summary || 'Strategic goal'}
                      </p>
                    </div>

                    {/* Status Badge and Chevron */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <StatusBadge status={goalStatus} size="sm" />
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for objectives with no goals */}
      {level1Goals.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            This objective doesn't have any goals defined yet. Goals help track progress toward achieving this strategic objective.
          </p>
        </div>
      )}
    </div>
  );
}
