import { Link, useNavigate } from 'react-router-dom';
import { Plus, Target, ChevronRight } from 'lucide-react';
import { useAdminContext } from '../../../../hooks/useAdminContext';
import { useSchoolGoals } from '../../../../hooks/useGoals';
import { PublishStatusBadge } from '../../../../components/admin/dashboard';

/**
 * SchoolObjectives - List and manage school objectives
 */
export function SchoolObjectives() {
  const navigate = useNavigate();
  const { school, basePath, isLoading: contextLoading } = useAdminContext();
  const { data: goalsData = [], isLoading: goalsLoading } = useSchoolGoals(school?.id || '');

  // Extract objectives (level 0 goals)
  const objectives = goalsData.filter((g) => g.level === 0);

  const isLoading = contextLoading || goalsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-100 rounded mt-2" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Objectives</h1>
          <p className="text-sm text-slate-500 mt-1">
            {school?.name} • {objectives.length} objective{objectives.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate(`${basePath}/objectives/new`)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Objective
        </button>
      </div>

      {/* Objectives List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {objectives.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No objectives yet
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Create your first strategic objective to get started.
            </p>
            <button
              onClick={() => navigate(`${basePath}/objectives/new`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Objective
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {objectives.map((objective) => (
              <Link
                key={objective.id}
                to={`${basePath}/objectives/${objective.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
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
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {objective.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <PublishStatusBadge isPublished={objective.is_public} />
                      <span className="text-sm text-slate-500">
                        {objective.children?.length || 0} goals
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
