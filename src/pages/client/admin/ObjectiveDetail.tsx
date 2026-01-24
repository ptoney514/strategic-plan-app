import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoal, useGoals, useUpdateGoal } from '../../../hooks/useGoals';
import { useMetricsByDistrict, useUpdateMetric } from '../../../hooks/useMetrics';
import { HeaderSection } from '../../../components/admin/HeaderSection';
import { GoalCardEditable } from '../../../components/admin/GoalCardEditable';
import { MetricsManagementModal } from '../../../components/admin/MetricsManagementModal';
import {
  ChevronLeft,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import type { Goal, Metric, HierarchicalGoal } from '../../../lib/types';
import { toast } from '../../../components/Toast';

/**
 * ObjectiveDetail - Read-only detail view for strategic objectives
 * Shows objective information with edit button, following view-first UX pattern
 */
export function ObjectiveDetail() {
  const { objectiveId } = useParams<{ objectiveId: string }>();
  const { slug } = useSubdomain();
  const { data: district, isLoading: districtLoading } = useDistrict(slug || '');
  const { data: objective, isLoading: objectiveLoading, error: objectiveError } = useGoal(objectiveId || '');
  const { data: allGoals, isLoading: goalsLoading } = useGoals(district?.id || '');
  const { data: allMetrics } = useMetricsByDistrict(district?.id || '');

  // Find the objective in hierarchical data to get nested children
  const objectiveWithChildren = allGoals?.find(g => g.id === objectiveId) as HierarchicalGoal | undefined;

  // Extract level 1 goals with their level 2 children nested
  const level1Goals = (objectiveWithChildren?.children || []).sort((a, b) => {
    const aNum = parseFloat(a.goal_number?.replace(/[^\d.]/g, '') || '0');
    const bNum = parseFloat(b.goal_number?.replace(/[^\d.]/g, '') || '0');
    return aNum - bNum;
  });

  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());

  // Inline editing state
  const [editingSection, setEditingSection] = useState<'header' | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [metricsModalGoalId, setMetricsModalGoalId] = useState<string | null>(null);
  const updateGoalMutation = useUpdateGoal();
  const updateMetricMutation = useUpdateMetric();

  // Only show loading if district is loading, or if we have a district and goals are loading
  const isLoading = objectiveLoading || districtLoading || (!!district?.id && goalsLoading);

  // Auto-expand all goals when they load (include level 2 goals)
  useEffect(() => {
    if (level1Goals.length > 0) {
      const allIds: string[] = [];
      level1Goals.forEach(g => {
        allIds.push(g.id);
        // Also include level 2 goal IDs
        const children = (g as HierarchicalGoal).children || [];
        children.forEach(child => allIds.push(child.id));
      });
      setExpandedGoalIds(new Set(allIds));
    }
  }, [level1Goals]);

  // Toggle goal metrics expansion
  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoalIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  // Handle save header edits
  const handleSaveHeader = async (updates: Partial<Goal>) => {
    if (!objectiveId) return;

    try {
      await updateGoalMutation.mutateAsync({
        id: objectiveId,
        updates,
      });
      toast.success('Objective updated successfully');
      setEditingSection(null);
    } catch (error) {
      console.error('Failed to update objective:', error);
      toast.error('Failed to update objective');
      throw error; // Re-throw to keep edit mode active on error
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Simple cancel without confirmation for now
    setEditingSection(null);
    setEditingGoalId(null);
  };

  // Handle edit goal
  const handleEditGoal = (goalId: string) => {
    setEditingGoalId(goalId);
    setEditingSection(null); // Close header edit if open
  };

  // Handle save goal
  const handleSaveGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await updateGoalMutation.mutateAsync({
        id: goalId,
        updates,
      });
      toast.success('Goal updated successfully');
      setEditingGoalId(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
      throw error; // Re-throw to keep edit mode active on error
    }
  };

  // Handle edit individual metric (inline)
  const handleEditMetric = (metricId: string) => {
    setEditingMetricId(metricId);
  };

  // Handle save metric
  const handleSaveMetric = async (metricId: string, updates: Partial<Metric>) => {
    try {
      await updateMetricMutation.mutateAsync({
        id: metricId,
        updates,
      });
      toast.success('Metric updated successfully');
      setEditingMetricId(null);
    } catch (error) {
      console.error('Failed to update metric:', error);
      toast.error('Failed to update metric');
      throw error; // Re-throw to keep edit mode active on error
    }
  };

  // Handle cancel edit metric
  const handleCancelEditMetric = () => {
    setEditingMetricId(null);
  };

  // Determine if a section should be dimmed
  const isDimmed = (goalId?: string) => {
    if (editingSection === 'header') return true; // Dim goals when editing header
    if (editingGoalId && (!goalId || editingGoalId !== goalId)) return true; // Dim other goals when editing one
    return false;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingSection || editingGoalId) {
          handleCancelEdit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingSection, editingGoalId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#10b981] mx-auto mb-3" />
          <p className="text-[#8a8a8a]">Loading objective...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (objectiveError || !objective) {
    return (
      <div className="min-h-screen bg-[#fafaf8]">
        <div className="px-10 py-8 max-w-[1100px]">
          <div className="bg-white border border-[#fee2e2] rounded-xl p-8 text-center">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">
              Objective not found
            </h2>
            <p className="text-[#8a8a8a] mb-4">
              The objective you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              to="/admin/objectives"
              className="inline-flex items-center gap-2 text-[#b85c38] hover:underline font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to objectives
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="px-10 py-8 max-w-[1100px]">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            to="/admin/objectives"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All objectives
          </Link>
        </div>

        {/* Header Section - Editable Inline */}
        <HeaderSection
          objective={objective}
          isEditing={editingSection === 'header'}
          onEdit={() => setEditingSection('header')}
          onSave={handleSaveHeader}
          onCancel={handleCancelEdit}
        />

        {/* Child Goals Section - Dimmed when editing */}
        <div className={`mb-8 transition-opacity ${editingSection ? 'opacity-60 pointer-events-none' : ''}`}>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">
            Goals
          </h2>

          {level1Goals.length === 0 ? (
            // Empty State
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-[#f5f3ef] rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-6 w-6 text-[#8a8a8a]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
                No goals yet
              </h3>
              <p className="text-[#8a8a8a] mb-4">
                This objective doesn't have any goals defined yet.
              </p>
              <Link
                to={`/admin/objectives/${objective.id}/edit`}
                className="inline-flex items-center gap-2 text-[#b85c38] hover:underline font-medium"
              >
                Add goals
              </Link>
            </div>
          ) : (
            // Goal Cards with Inline Editing - Flex Layout for nested sub-goals
            <div className="flex flex-col gap-4">
              {level1Goals.map((goal) => {
                // Get metrics for this goal
                const goalMetrics = allMetrics?.filter(m => m.goal_id === goal.id) || [];
                const isExpanded = expandedGoalIds.has(goal.id);
                const isEditing = editingGoalId === goal.id;
                // Get level 2 sub-goals (nested in hierarchical data)
                const level2Goals = (goal as HierarchicalGoal).children || [];

                return (
                  <div key={goal.id}>
                    <GoalCardEditable
                      goal={goal}
                      metrics={goalMetrics}
                      isExpanded={isExpanded}
                      isEditing={isEditing}
                      isDimmed={isDimmed(goal.id)}
                      onToggleExpand={() => toggleGoalExpanded(goal.id)}
                      onEdit={() => handleEditGoal(goal.id)}
                      onSave={(updates) => handleSaveGoal(goal.id, updates)}
                      onCancel={() => setEditingGoalId(null)}
                      editingMetricId={editingMetricId}
                      onEditMetric={handleEditMetric}
                      onSaveMetric={handleSaveMetric}
                      onCancelEditMetric={handleCancelEditMetric}
                    />

                    {/* Level 2 Sub-goals (nested below level 1 when expanded) */}
                    {isExpanded && level2Goals.length > 0 && (
                      <div className="ml-6 mt-2 space-y-2">
                        {level2Goals.map((subGoal) => {
                          const subGoalMetrics = allMetrics?.filter(m => m.goal_id === subGoal.id) || [];
                          const isSubGoalExpanded = expandedGoalIds.has(subGoal.id);
                          const isSubGoalEditing = editingGoalId === subGoal.id;

                          return (
                            <GoalCardEditable
                              key={subGoal.id}
                              goal={subGoal}
                              metrics={subGoalMetrics}
                              isExpanded={isSubGoalExpanded}
                              isEditing={isSubGoalEditing}
                              isDimmed={isDimmed(subGoal.id)}
                              onToggleExpand={() => toggleGoalExpanded(subGoal.id)}
                              onEdit={() => handleEditGoal(subGoal.id)}
                              onSave={(updates) => handleSaveGoal(subGoal.id, updates)}
                              onCancel={() => setEditingGoalId(null)}
                              editingMetricId={editingMetricId}
                              onEditMetric={handleEditMetric}
                              onSaveMetric={handleSaveMetric}
                              onCancelEditMetric={handleCancelEditMetric}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Management Modal */}
      {metricsModalGoalId && (() => {
        // Search for goal in level 1 or level 2
        let modalGoal = level1Goals.find(g => g.id === metricsModalGoalId);
        if (!modalGoal) {
          // Search in level 2 goals
          for (const level1Goal of level1Goals) {
            const level2Goals = (level1Goal as HierarchicalGoal).children || [];
            const found = level2Goals.find(g => g.id === metricsModalGoalId);
            if (found) {
              modalGoal = found;
              break;
            }
          }
        }
        const modalMetrics = allMetrics?.filter(m => m.goal_id === metricsModalGoalId) || [];

        if (!modalGoal) return null;

        return (
          <MetricsManagementModal
            isOpen={true}
            onClose={() => setMetricsModalGoalId(null)}
            goal={modalGoal}
            metrics={modalMetrics}
            onMetricAdd={() => {
              // TODO: Integrate MetricBuilderWizard for adding metrics
              toast.info('Metric builder integration coming soon');
            }}
            onMetricSave={async (metricId, updates) => {
              try {
                await updateMetricMutation.mutateAsync({
                  id: metricId,
                  updates,
                });
                toast.success('Metric updated successfully');
              } catch (error) {
                console.error('Failed to update metric:', error);
                toast.error('Failed to update metric');
                throw error; // Re-throw to keep edit mode active on error
              }
            }}
            onMetricDelete={async (metricId) => {
              // TODO: Implement metric deletion with useDeleteMetric hook
              toast.info('Metric deletion integration coming soon');
              console.log('Delete metric:', metricId);
            }}
          />
        );
      })()}
    </div>
  );
}
