import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import type { Goal } from '../../../lib/types';

interface ObjectivesListProps {
  objectives: Goal[];
  basePath: string;
  isLoading?: boolean;
}

/**
 * List of objectives with publish/draft status badges
 */
export function ObjectivesList({
  objectives,
  basePath,
  isLoading = false,
}: ObjectivesListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Objectives</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Objectives</h2>
        <Link
          to={`${basePath}/objectives`}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          View All
        </Link>
      </div>

      {objectives.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No objectives yet</p>
          <Link
            to={`${basePath}/objectives/new`}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium mt-2 inline-block"
          >
            Create your first objective
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {objectives.slice(0, 5).map((objective) => (
            <Link
              key={objective.id}
              to={`${basePath}/objectives/${objective.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{
                    backgroundColor:
                      objective.color === 'red'
                        ? '#EF4444'
                        : objective.color === 'blue'
                          ? '#3B82F6'
                          : objective.color === 'green'
                            ? '#10B981'
                            : '#F59E0B',
                  }}
                >
                  {objective.goal_number}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {objective.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PublishStatusBadge isPublished={objective.is_public} />
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>
          ))}

          {objectives.length > 5 && (
            <Link
              to={`${basePath}/objectives`}
              className="block text-center py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              +{objectives.length - 5} more objectives
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

interface PublishStatusBadgeProps {
  isPublished?: boolean;
}

/**
 * Badge showing Published or Draft status
 */
export function PublishStatusBadge({ isPublished = false }: PublishStatusBadgeProps) {
  if (isPublished) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      Draft
    </span>
  );
}
