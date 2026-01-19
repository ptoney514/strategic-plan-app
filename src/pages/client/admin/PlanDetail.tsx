import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Pencil,
  Plus,
  Target,
  Globe,
  Lock,
  Calendar,
  Loader2,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { usePlanWithSummary } from '../../../hooks/usePlans';
import { usePlanGoals } from '../../../hooks/useGoals';

/**
 * PlanDetail - View a strategic plan and its objectives
 */
export function PlanDetail() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { data: plan, isLoading: planLoading } = usePlanWithSummary(planId || '');
  const { data: objectives, isLoading: objectivesLoading } = usePlanGoals(planId || '');

  const isLoading = planLoading || objectivesLoading;

  const handleEditPlan = () => {
    navigate(`/admin/plans/${planId}/edit`);
  };

  const handleCreateObjective = () => {
    // Navigate to create objective with plan context
    navigate(`/admin/objectives/create?planId=${planId}`);
  };

  const handleViewObjective = (objectiveId: string) => {
    navigate(`/admin/objectives/${objectiveId}`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Plan not found</h2>
          <p className="text-slate-500 mb-4">The plan you're looking for doesn't exist.</p>
          <Link
            to="/admin/plans"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/admin/plans"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft size={16} />
        All Plans
      </Link>

      {/* Plan Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{plan.name}</h1>
              {plan.is_public ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <Globe size={12} />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  <Lock size={12} />
                  Private
                </span>
              )}
              {plan.type_label && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {plan.type_label}
                </span>
              )}
            </div>

            {plan.description && (
              <p className="text-slate-600 mb-4">{plan.description}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-slate-500">
              {(plan.start_date || plan.end_date) && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(plan.start_date)}
                  {plan.start_date && plan.end_date && ' - '}
                  {formatDate(plan.end_date)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Target size={14} />
                {plan.objectiveCount || 0} objectives
              </span>
            </div>
          </div>

          <button
            onClick={handleEditPlan}
            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit Plan
          </button>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Objectives</h2>
          <button
            onClick={handleCreateObjective}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
          >
            <Plus size={16} />
            Add Objective
          </button>
        </div>

        {(!objectives || objectives.length === 0) ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No objectives yet</h3>
            <p className="text-sm text-slate-500 mb-4">
              Add objectives to this plan to start tracking your strategic goals
            </p>
            <button
              onClick={handleCreateObjective}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
            >
              <Plus size={16} />
              Create your first objective
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {objectives.map((objective) => (
              <button
                key={objective.id}
                onClick={() => handleViewObjective(objective.id)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                    objective.color === 'red' ? 'bg-red-500' :
                    objective.color === 'blue' ? 'bg-blue-500' :
                    objective.color === 'amber' ? 'bg-amber-500' :
                    objective.color === 'green' ? 'bg-green-500' :
                    'bg-slate-500'
                  }`}
                >
                  {objective.goal_number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{objective.title}</h3>
                  {objective.description && (
                    <p className="text-sm text-slate-500 truncate">{objective.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{objective.children?.length || 0} goals</span>
                  <span>{objective.metrics?.length || 0} metrics</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
