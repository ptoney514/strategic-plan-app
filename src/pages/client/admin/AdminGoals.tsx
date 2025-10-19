import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MetricBuilderWizard } from '../../../components/MetricBuilderWizard';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  X,
  Trash2,
  AlertTriangle,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Target
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics, useCreateMetric } from '../../../hooks/useMetrics';
import { GoalsService } from '../../../lib/services/goals.service';
import { SlidePanel } from '../../../components/SlidePanel';
import { PerformanceIndicator } from '../../../components/PerformanceIndicator';
import { AnnualProgressChart } from '../../../components/AnnualProgressChart';
import { GoalNarrativeDetail } from '../../../components/GoalNarrativeDetail';
import type { Goal, HierarchicalGoal } from '../../../lib/types';
import { getProgressColor } from '../../../lib/types';

export function AdminGoals() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: district } = useDistrict(slug!);
  const { data: goals, isLoading: loading, refetch } = useGoals(district?.id!);
  const { data: metrics, refetch: refetchMetrics } = useMetrics(district?.id!);
  const createMetricMutation = useCreateMetric();
  const [metricWizardGoal, setMetricWizardGoal] = useState<Goal | null>(null);

  // Auto-expand all objectives to show their child goals
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  // Auto-expand all level 0 goals when data loads
  React.useEffect(() => {
    if (goals) {
      const level0Ids = goals.filter(g => g.level === 0).map(g => g.id);
      setExpandedGoals(new Set(level0Ids));
    }
  }, [goals]);
  const [deleteModal, setDeleteModal] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewGoal, setPreviewGoal] = useState<Goal | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [expandedPreviewGoalId, setExpandedPreviewGoalId] = useState<string | null>(null);
  const [expandedPreviewSubGoalId, setExpandedPreviewSubGoalId] = useState<string | null>(null);
  
  const toggleExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleDelete = async (goal: Goal) => {
    if (!goal) return;

    setIsDeleting(true);
    try {
      await GoalsService.delete(goal.id);
      await refetch();
      setDeleteModal(null);
      alert('Objective deleted successfully');
    } catch (error) {
      console.error('Error deleting objective:', error);
      alert('Failed to delete objective. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'at-risk':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'off-target':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      'on-target': 'bg-green-100 text-green-800',
      'at-risk': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800',
      'off-target': 'bg-orange-100 text-orange-800',
      'not-started': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status || 'not-started']}`}>
        {status?.replace('-', ' ') || 'Not Started'}
      </span>
    );
  };
  
  const renderGoalRow = (goal: HierarchicalGoal, level: number = 0) => {
    const hasChildren = goal.children && goal.children.length > 0;
    const isExpanded = expandedGoals.has(goal.id);
    const goalMetrics = metrics?.filter(m => m.goal_id === goal.id) || [];
    const isObjective = level === 0;

    // Calculate metrics summary
    const metricsWithValues = goalMetrics.filter(m => m.current_value && m.target_value);
    const avgProgress = metricsWithValues.length > 0
      ? metricsWithValues.reduce((sum, m) => {
          const progress = m.current_value! / m.target_value! * 100;
          return sum + progress;
        }, 0) / metricsWithValues.length
      : null;

    return (
      <React.Fragment key={goal.id}>
        <tr className={`border-b hover:bg-muted/50 ${
          isObjective ? 'bg-blue-50/50' : level > 0 ? 'bg-muted/20' : ''
        }`}>
          <td className="py-3 px-4">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(goal.id)}
                  className="mr-2 p-1 hover:bg-muted rounded"
                >
                  {isExpanded ?
                    <ChevronDown className="h-4 w-4" /> :
                    <ChevronRight className="h-4 w-4" />
                  }
                </button>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className={`${isObjective ? 'font-bold text-lg' : 'font-medium'}`}>
                    {goal.goal_number} {goal.title}
                  </p>
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
          </td>

          <td className="py-3 px-4">
            <div className="flex items-center space-x-2">
              {isObjective && (
                <button
                  onClick={() => {
                    setPreviewGoal(goal);
                    setShowPreviewPanel(true);
                  }}
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Preview Public View"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => {
                  if (goal.level === 0) {
                    navigate(`/${slug}/admin/objectives/${goal.id}/edit`);
                  } else {
                    // For level 1+ goals, navigate to edit the parent objective
                    // The user can then edit the goal within the objective builder
                    navigate(`/${slug}/admin/objectives/${goal.parent_id}/edit`);
                  }
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title={goal.level === 0 ? "Edit Objective" : "Edit Goal"}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {isObjective ? (
                <button
                  onClick={() => setDeleteModal(goal)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Objective"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setMetricWizardGoal(goal)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  title="Add Measure"
                >
                  <BarChart3 className="h-3 w-3" />
                  <span>Add Measure</span>
                </button>
              )}
            </div>
          </td>
        </tr>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && goal.children?.map(child => 
          renderGoalRow(child as HierarchicalGoal, level + 1)
        )}
      </React.Fragment>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Strategic Objectives & Goals
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your strategic objectives and their goals
            </p>
          </div>
          <button
            onClick={() => navigate(`/${slug}/admin/objectives/new`)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Strategic Objective</span>
            <span className="sm:hidden">New Objective</span>
          </button>
        </div>

        {/* Goals Table - Desktop Only */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Strategic Objectives and Goals</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals?.filter(g => g.level === 0).map(goal =>
                  renderGoalRow(goal as HierarchicalGoal)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Goals Cards - Mobile Only */}
        <div className="md:hidden space-y-3">
          {goals?.filter(g => g.level === 0).map(goal => {
            const goalMetrics = metrics?.filter(m => m.goal_id === goal.id) || [];
            const hasChildren = goal.children && goal.children.length > 0;
            const isExpanded = expandedGoals.has(goal.id);

            return (
              <div key={goal.id} className="bg-white rounded-lg border border-border">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpanded(goal.id)}
                            className="p-1 hover:bg-muted rounded flex-shrink-0"
                          >
                            {isExpanded ?
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronRight className="h-4 w-4" />
                            }
                          </button>
                        )}
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {goal.goal_number}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                        {goal.title}
                      </h3>
                    </div>
                    {getStatusIcon(goal.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(goal.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Metrics:</span>
                      <span className="font-medium">{goalMetrics.length || 0}</span>
                    </div>

                    {goal.overall_progress !== null && goal.overall_progress !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{Math.round(goal.overall_progress)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => {
                        setPreviewGoal(goal);
                        setShowPreviewPanel(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        if (goal.level === 0) {
                          navigate(`/${slug}/admin/objectives/${goal.id}/edit`);
                        } else {
                          // For level 1+ goals, navigate to edit the parent objective
                          navigate(`/${slug}/admin/objectives/${goal.parent_id}/edit`);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteModal(goal)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Child Goals */}
                {hasChildren && isExpanded && (
                  <div className="border-t border-border bg-muted/20">
                    {goal.children?.map((child: any) => (
                      <div key={child.id} className="p-3 border-b border-border last:border-b-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground">{child.goal_number}</span>
                              {getStatusBadge(child.status)}
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">{child.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h2 className="text-xl font-bold text-foreground">Delete Objective</h2>
                  </div>
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="p-1 hover:bg-muted rounded"
                    disabled={isDeleting}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                {/* Danger Zone Warning */}
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900">Danger Zone</h3>
                      <p className="text-sm text-red-800 mt-1">
                        This action cannot be undone. This will permanently delete the objective and all associated data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Objective Details */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">You are about to delete:</p>
                  <div className="p-3 bg-muted/50 rounded border border-border">
                    <p className="font-semibold text-foreground">
                      {deleteModal.goal_number} {deleteModal.title}
                    </p>
                  </div>
                </div>

                {/* Cascade Warning */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">This will also delete:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      <span>All child goals under this objective</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      <span>All metrics associated with this objective and its goals</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      <span>All historical data and progress tracking</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-end space-x-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Objective</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metric Builder Wizard */}
        {metricWizardGoal && (
          <MetricBuilderWizard
            isOpen={!!metricWizardGoal}
            onClose={() => setMetricWizardGoal(null)}
            onSave={async (metricData) => {
              await createMetricMutation.mutateAsync(metricData);
              await refetchMetrics();
            }}
            goalId={metricWizardGoal.id}
            goalNumber={metricWizardGoal.goal_number || ''}
          />
        )}

        {/* Preview Panel - Public View */}
        <SlidePanel
          isOpen={showPreviewPanel}
          onClose={() => {
            setShowPreviewPanel(false);
            setPreviewGoal(null);
            setExpandedPreviewGoalId(null);
            setExpandedPreviewSubGoalId(null);
          }}
          title={previewGoal?.title || 'Objective Preview'}
        >
          {previewGoal && (
            <div className="h-full flex flex-col">
              {/* Header Section - Fixed */}
              <div className="p-6 border-b border-neutral-200 space-y-4">
                {/* Preview Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                  <Eye className="h-4 w-4" />
                  <span>Public View Preview</span>
                </div>

                {/* Description */}
                <div>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {previewGoal.description || 'Strategic initiatives focused on this objective'}
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Goals Overview Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goals
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    This is how your strategic objective and goals will appear to the public. Click on any goal to expand details.
                  </p>
                </div>

                {/* Goals List */}
                {previewGoal.children && previewGoal.children.length > 0 ? (
                  <div className="space-y-4">
                    {previewGoal.children.map((child: any, index: number) => {
                      const childProgress = child.overall_progress_override ?? child.overall_progress ?? 0;
                      const isExpanded = expandedPreviewGoalId === child.id;

                      return (
                        <div key={child.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all">
                          <div className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                                <span className="text-sm font-semibold text-neutral-900">
                                  {child.goal_number}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-neutral-900 mb-1">{child.title}</h4>
                                {child.description && !isExpanded && (
                                  <p className="text-sm text-neutral-600 mb-2">{child.description}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  In Progress
                                </span>
                              </div>
                            </div>

                            {/* Performance Indicator - Only show if enabled */}
                            {child.show_progress_bar !== false && (
                              <PerformanceIndicator
                                progress={childProgress}
                                displayMode={child.overall_progress_display_mode || 'qualitative'}
                                customValue={child.overall_progress_custom_value}
                                showLabels={true}
                                onClick={() => {
                                  setExpandedPreviewGoalId(isExpanded ? null : child.id);
                                }}
                              />
                            )}
                          </div>

                          {/* Expanded Detail Section */}
                          {isExpanded && (
                            <div className="border-t border-neutral-200 p-5 bg-neutral-50 animate-in slide-in-from-top duration-300">
                              <div className="space-y-4">
                                {/* Level 2 Sub-goals */}
                                {child.children && child.children.length > 0 && (
                                  <div className="space-y-3 pt-4">
                                    <h5 className="text-sm font-semibold text-neutral-700">Sub-Goals</h5>
                                    {child.children.map((subGoal: any) => {
                                      const isSubExpanded = expandedPreviewSubGoalId === subGoal.id;
                                      const subGoalProgress = subGoal.overall_progress_override ?? subGoal.overall_progress ?? 0;

                                      return (
                                        <div key={subGoal.id} className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
                                          <div className="p-4">
                                            <div className="flex items-start gap-2 mb-3">
                                              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
                                                <span className="text-xs font-semibold text-neutral-900">
                                                  {subGoal.goal_number}
                                                </span>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h5 className="text-sm font-medium text-neutral-900">{subGoal.title}</h5>
                                                {subGoal.description && !isSubExpanded && (
                                                  <p className="text-xs text-neutral-600 mt-1">{subGoal.description}</p>
                                                )}
                                              </div>
                                            </div>

                                            {/* Performance Indicator for Sub-goal - Only show if enabled */}
                                            {subGoal.show_progress_bar !== false && (
                                              <PerformanceIndicator
                                                progress={subGoalProgress}
                                                displayMode={subGoal.overall_progress_display_mode || 'percentage'}
                                                customValue={subGoal.overall_progress_custom_value}
                                                showLabels={false}
                                                onClick={() => {
                                                  setExpandedPreviewSubGoalId(isSubExpanded ? null : subGoal.id);
                                                }}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {(!child.children || child.children.length === 0) && (
                                  <div className="text-center py-8 text-neutral-500">
                                    <p className="text-sm">No sub-goals or detailed metrics available for this goal yet.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <Target className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="font-medium">No goals defined yet</p>
                    <p className="text-sm mt-1">Goals will appear here once they are added to this objective.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SlidePanel>
    </div>
  );
}