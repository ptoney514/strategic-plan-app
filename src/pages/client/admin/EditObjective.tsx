import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import {
  ChevronRight,
  Plus,
  GripVertical,
  Trash2,
  Lightbulb,
  Layers,
  TrendingUp,
  Globe,
  Lock,
  Calendar,
  Save,
  ChevronUp,
  ChevronDown,
  Check,
  Edit2,
  BarChart3,
  Hash,
  Loader2
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoal, useUpdateGoal, useChildGoals } from '../../../hooks/useGoals';
import { GoalEditor, type GoalFormData, type MetricFormData } from '../../../components/admin/GoalEditor';
import { SlideoverPanel } from '../../../components/ui/SlideoverPanel';
import { Target } from 'lucide-react';
import { GoalsService } from '../../../lib/services/goals.service';
import { MetricsService } from '../../../lib/services/metrics.service';
import { ApiError } from '../../../lib/api';
import { toast } from '../../../components/Toast';
import type { Goal, HierarchicalGoal } from '../../../lib/types';
import { ConfirmDialog } from '../../../components/Modal';

// Stored goal with all its data
interface StoredGoal {
  id: string;
  data: GoalFormData;
  metrics: MetricFormData[];
  level: 1 | 2;
  isExisting?: boolean; // Track if this was an existing child goal
}

/**
 * EditObjective - Editorial-style objective editing page
 * Matches the design pattern of CreateObjective
 * Loads existing objective data and allows editing
 */
export function EditObjective() {
  const { objectiveId } = useParams();
  const { slug } = useSubdomain();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: district } = useDistrict(slug || '');
  const { data: objective, isLoading: objectiveLoading, error: objectiveError } = useGoal(objectiveId || '');
  const { data: childGoals } = useChildGoals(objectiveId || '');
  const updateGoal = useUpdateGoal();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalsExpanded, setGoalsExpanded] = useState(true);

  // Enhanced goals state - stores full goal data
  const [goals, setGoals] = useState<StoredGoal[]>([]);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [preferredParentId, setPreferredParentId] = useState<string | null>(null);
  const [goalPendingDelete, setGoalPendingDelete] = useState<StoredGoal | null>(null);

  // Visual Badge state
  const [showVisualBadge, setShowVisualBadge] = useState(true);
  const [badgeType, setBadgeType] = useState<'on-target' | 'needs-attention' | 'off-target'>('on-target');
  const [customBadgeText, setCustomBadgeText] = useState('On Target');
  const [badgeColor, setBadgeColor] = useState('#22c55e');

  // Progress Bar state
  const [showProgressBar, setShowProgressBar] = useState(true);

  // Visibility state
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Date state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load existing objective data when it's fetched
  useEffect(() => {
    if (objective) {
      setTitle(objective.title || '');
      setDescription(objective.description || '');
      setVisibility(objective.is_public ? 'public' : 'private');
      setShowProgressBar(objective.show_progress_bar ?? true);
      setStartDate(objective.start_date || '');
      setEndDate(objective.end_date || '');

      // Set badge state based on indicator
      if (objective.indicator_text) {
        setCustomBadgeText(objective.indicator_text);
        setBadgeColor(objective.indicator_color || '#22c55e');
        setShowVisualBadge(true);

        // Detect badge type from text
        if (objective.indicator_text.toLowerCase().includes('on target')) {
          setBadgeType('on-target');
        } else if (objective.indicator_text.toLowerCase().includes('needs attention')) {
          setBadgeType('needs-attention');
        } else if (objective.indicator_text.toLowerCase().includes('off target')) {
          setBadgeType('off-target');
        }
      }
    }
  }, [objective]);

  const mapGoalToStoredGoal = (goal: Goal, level: 1 | 2): StoredGoal => ({
    id: goal.id,
    level,
    isExisting: true,
    data: {
      title: goal.title,
      description: goal.description || '',
      parent_id: goal.parent_id,
      indicator_text: goal.indicator_text || 'On Target',
      indicator_color: goal.indicator_color || '#22c55e',
      start_date: goal.start_date || '',
      end_date: goal.end_date || '',
      show_progress_bar: goal.show_progress_bar ?? true,
      is_public: goal.is_public ?? true,
    },
    metrics: (goal.metrics || []).map((m) => ({
      id: m.id,
      name: m.name || m.metric_name || '',
      description: m.description || '',
      metric_type: (m.metric_type as 'rating' | 'number' | 'percent') || 'number',
      visualization_type: (m.visualization_type as 'likert' | 'number' | 'progress') || 'number',
      current_value: m.current_value ?? null,
      target_value: m.target_value ?? null,
      unit: m.unit || '',
      visualization_config: (m.visualization_config as MetricFormData['visualization_config']) || {},
    })),
  });

  // Load existing level-1 goals and level-2 sub-goals
  useEffect(() => {
    let cancelled = false;

    const loadGoalsAndSubGoals = async () => {
      if (!childGoals || childGoals.length === 0) {
        if (!cancelled) setGoals([]);
        return;
      }

      const storedGoals: StoredGoal[] = [];

      for (const childGoal of childGoals) {
        storedGoals.push(mapGoalToStoredGoal(childGoal, 1));

        const subGoals = await GoalsService.getChildren(childGoal.id);
        subGoals.forEach((subGoal) => {
          storedGoals.push(mapGoalToStoredGoal(subGoal, 2));
        });
      }

      if (!cancelled) {
        setGoals(storedGoals);
      }
    };

    loadGoalsAndSubGoals().catch((error) => {
      console.error('Failed to load goal hierarchy:', error);
      if (!cancelled) {
        toast.error('Failed to load all sub-goals. Refresh and try again.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [childGoals]);

  const handleBadgeTypeChange = (type: 'on-target' | 'needs-attention' | 'off-target') => {
    setBadgeType(type);
    if (type === 'on-target') {
      setCustomBadgeText('On Target');
      setBadgeColor('#22c55e');
    } else if (type === 'needs-attention') {
      setCustomBadgeText('Needs Attention');
      setBadgeColor('#f59e0b');
    } else {
      setCustomBadgeText('Off Target');
      setBadgeColor('#ef4444');
    }
  };

  // Handle saving a goal from the GoalEditor
  const handleSaveGoal = async (goalData: GoalFormData, metrics: MetricFormData[]) => {
    const normalizedParentId = goalData.parent_id || objectiveId || null;
    if (!normalizedParentId) {
      toast.error('Parent objective is missing. Refresh and try again.');
      return;
    }
    const level: 1 | 2 = normalizedParentId === objectiveId ? 1 : 2;

    if (editingGoalIndex !== null) {
      // Update existing goal
      const updated = [...goals];
      updated[editingGoalIndex] = {
        ...updated[editingGoalIndex],
        level,
        data: {
          ...goalData,
          parent_id: normalizedParentId,
        },
        metrics,
      };
      setGoals(updated);
      setEditingGoalIndex(null);
    } else {
      // Add new goal
      setGoals([
        ...goals,
        {
          id: crypto.randomUUID(),
          level,
          data: {
            ...goalData,
            parent_id: normalizedParentId,
          },
          metrics,
        },
      ]);
    }
    setPreferredParentId(null);
    setShowGoalEditor(false);
  };

  // Handle editing a goal
  const handleEditGoal = (index: number) => {
    setEditingGoalIndex(index);
    setPreferredParentId(null);
    setShowGoalEditor(true);
  };

  // Handle removing a goal
  const handleRemoveGoal = (index: number) => {
    const goalToRemove = goals[index];
    if (!goalToRemove) return;

    if (goalToRemove.level === 1) {
      const childSubGoalCount = goals.filter(
        (goal) => goal.data.parent_id === goalToRemove.id,
      ).length;
      if (childSubGoalCount > 0) {
        setGoalPendingDelete(goalToRemove);
        return;
      }
    }

    setGoalPendingDelete(null);

    setGoals((previousGoals) => {
      if (goalToRemove.level === 1) {
        return previousGoals.filter(
          (goal) => goal.id !== goalToRemove.id && goal.data.parent_id !== goalToRemove.id,
        );
      }

      return previousGoals.filter((goal) => goal.id !== goalToRemove.id);
    });
  };

  const buildMetricPayload = (
    goalId: string,
    districtId: string,
    metric: MetricFormData,
  ) => ({
    goal_id: goalId,
    district_id: districtId,
    metric_name: metric.name.trim(),
    name: metric.name.trim(),
    description: metric.description?.trim() || undefined,
    metric_type: metric.metric_type,
    current_value: metric.current_value ?? undefined,
    target_value: metric.target_value ?? undefined,
    unit: metric.unit || '',
    visualization_type: metric.visualization_type,
    visualization_config: metric.visualization_config,
    frequency: 'quarterly' as const,
    aggregation_method: 'latest' as const,
  });

  const syncGoalMetrics = async (
    goalId: string,
    districtId: string,
    metrics: MetricFormData[],
  ) => {
    const existingMetrics = await MetricsService.getByGoal(goalId);
    const existingById = new Map(existingMetrics.map((m) => [m.id, m]));
    const persistedMetricIds = new Set<string>();

    for (const metric of metrics) {
      const payload = buildMetricPayload(goalId, districtId, metric);
      const shouldUpdate = !!metric.id && existingById.has(metric.id);

      if (shouldUpdate && metric.id) {
        await MetricsService.update(metric.id, payload);
        persistedMetricIds.add(metric.id);
      } else {
        const created = await MetricsService.create(payload);
        persistedMetricIds.add(created.id);
      }
    }

    for (const existingMetric of existingMetrics) {
      if (!persistedMetricIds.has(existingMetric.id)) {
        await MetricsService.delete(existingMetric.id);
      }
    }
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    setFormError(null);

    if (!objectiveId) {
      const message = 'Objective identifier is missing. Refresh and try again.';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!trimmedTitle) {
      const message = 'Objective title is required.';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!district?.id) {
      const message = 'District context was not loaded. Refresh and try again.';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!objective?.plan_id) {
      const message = 'Objective is not attached to a plan. Re-open this objective and try again.';
      setFormError(message);
      toast.error(message);
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      const message = 'End date must be on or after the start date.';
      setFormError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      // Update the main objective (level 0)
      await updateGoal.mutateAsync({
        id: objectiveId,
        updates: {
          title: trimmedTitle,
          description: description.trim() || undefined,
          is_public: visibility === 'public',
          indicator_text: showVisualBadge ? customBadgeText : undefined,
          indicator_color: showVisualBadge ? badgeColor : undefined,
          show_progress_bar: showProgressBar,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });

      // Snapshot current persisted hierarchy for non-destructive sync.
      const currentLevel1Goals = await GoalsService.getChildren(objectiveId);
      const currentLevel1ById = new Map(currentLevel1Goals.map((goal) => [goal.id, goal]));
      const currentLevel2ByParent = new Map<string, Goal[]>();
      for (const level1Goal of currentLevel1Goals) {
        const currentSubGoals = await GoalsService.getChildren(level1Goal.id);
        currentLevel2ByParent.set(level1Goal.id, currentSubGoals);
      }

      // Normalize goal parent + level from local editor state.
      const normalizedGoals = goals.map((goal) => {
        const parentId = goal.data.parent_id || objectiveId;
        const level: 1 | 2 = parentId === objectiveId ? 1 : 2;
        return {
          ...goal,
          level,
          data: {
            ...goal.data,
            parent_id: parentId,
          },
        };
      });

      const localLevel1Goals = normalizedGoals.filter((goal) => goal.level === 1);
      const localLevel2Goals = normalizedGoals.filter((goal) => goal.level === 2);

      const localToPersistedLevel1Id = new Map<string, string>();
      const keptLevel1Ids = new Set<string>();

      // Upsert level-1 goals first.
      for (const goal of localLevel1Goals) {
        const goalPayload: Partial<Goal> = {
          district_id: district.id,
          plan_id: objective.plan_id,
          parent_id: objectiveId,
          level: 1,
          title: goal.data.title.trim(),
          description: goal.data.description?.trim() || undefined,
          indicator_text: goal.data.indicator_text,
          indicator_color: goal.data.indicator_color,
          show_progress_bar: goal.data.show_progress_bar,
          is_public: goal.data.is_public,
          start_date: goal.data.start_date || undefined,
          end_date: goal.data.end_date || undefined,
        };

        let persistedGoalId: string;
        if (goal.isExisting && currentLevel1ById.has(goal.id)) {
          await GoalsService.update(goal.id, goalPayload);
          persistedGoalId = goal.id;
        } else {
          const created = await GoalsService.create(goalPayload);
          persistedGoalId = created.id;
        }

        localToPersistedLevel1Id.set(goal.id, persistedGoalId);
        keptLevel1Ids.add(persistedGoalId);
        await syncGoalMetrics(persistedGoalId, district.id, goal.metrics);
      }

      const keptLevel2IdsByParent = new Map<string, Set<string>>();

      // Upsert level-2 goals.
      for (const subGoal of localLevel2Goals) {
        const localParentId = subGoal.data.parent_id;
        if (!localParentId) continue;

        const resolvedParentId = localToPersistedLevel1Id.get(localParentId) || localParentId;
        if (!keptLevel1Ids.has(resolvedParentId)) {
          continue;
        }

        const goalPayload: Partial<Goal> = {
          district_id: district.id,
          plan_id: objective.plan_id,
          parent_id: resolvedParentId,
          level: 2,
          title: subGoal.data.title.trim(),
          description: subGoal.data.description?.trim() || undefined,
          indicator_text: subGoal.data.indicator_text,
          indicator_color: subGoal.data.indicator_color,
          show_progress_bar: subGoal.data.show_progress_bar,
          is_public: subGoal.data.is_public,
          start_date: subGoal.data.start_date || undefined,
          end_date: subGoal.data.end_date || undefined,
        };

        const persistedCurrentSubGoalIds = new Set(
          (currentLevel2ByParent.get(resolvedParentId) || []).map((goal) => goal.id),
        );

        let persistedSubGoalId: string;
        if (subGoal.isExisting && persistedCurrentSubGoalIds.has(subGoal.id)) {
          await GoalsService.update(subGoal.id, goalPayload);
          persistedSubGoalId = subGoal.id;
        } else {
          const created = await GoalsService.create(goalPayload);
          persistedSubGoalId = created.id;
        }

        if (!keptLevel2IdsByParent.has(resolvedParentId)) {
          keptLevel2IdsByParent.set(resolvedParentId, new Set<string>());
        }
        keptLevel2IdsByParent.get(resolvedParentId)!.add(persistedSubGoalId);
        await syncGoalMetrics(persistedSubGoalId, district.id, subGoal.metrics);
      }

      // Delete removed level-2 goals for parents that still exist.
      for (const [parentId, currentSubGoals] of currentLevel2ByParent.entries()) {
        if (!keptLevel1Ids.has(parentId)) continue;

        const keptSubGoalIds = keptLevel2IdsByParent.get(parentId) || new Set<string>();
        for (const persistedSubGoal of currentSubGoals) {
          if (!keptSubGoalIds.has(persistedSubGoal.id)) {
            await GoalsService.delete(persistedSubGoal.id);
          }
        }
      }

      // Delete removed level-1 goals (sub-goals cascade).
      for (const persistedLevel1Goal of currentLevel1Goals) {
        if (!keptLevel1Ids.has(persistedLevel1Goal.id)) {
          await GoalsService.delete(persistedLevel1Goal.id);
        }
      }

      toast.success('Objective, goals, and sub-goals saved successfully.');

      // Navigate back to the objective detail view (preserves subdomain query param on localhost)
      navigate(`/admin/objectives/${objectiveId}${location.search}`);
    } catch (error) {
      console.error('Failed to update objective:', error);
      const message = error instanceof ApiError
        ? error.message
        : 'Failed to save changes. Please try again.';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorPresets = [
    { hex: '#22c55e', name: 'green' },
    { hex: '#f59e0b', name: 'amber' },
    { hex: '#ef4444', name: 'red' },
    { hex: '#3b82f6', name: 'blue' },
    { hex: '#8b5cf6', name: 'purple' },
    { hex: '#6b7280', name: 'gray' },
  ];

  const level1Goals = useMemo(
    () => goals.filter((goal) => (goal.data.parent_id || objectiveId) === objectiveId),
    [goals, objectiveId],
  );
  const subGoalCount = goals.length - level1Goals.length;

  const subGoalsByParent = useMemo(() => {
    const map = new Map<string, StoredGoal[]>();

    goals.forEach((goal) => {
      const parentId = goal.data.parent_id;
      if (!parentId || parentId === objectiveId) return;

      const existing = map.get(parentId) || [];
      existing.push(goal);
      map.set(parentId, existing);
    });

    return map;
  }, [goals, objectiveId]);

  const parentSelectionGoals = useMemo<HierarchicalGoal[]>(() => {
    if (!objectiveId || !objective) return [];

    // Only include persisted level-1 goals as valid parents for new sub-goals.
    const persistedLevel1Goals = level1Goals
      .filter((goal) => goal.isExisting)
      .map((goal) => {
        const existingChildGoal = childGoals?.find((child) => child.id === goal.id);
        if (existingChildGoal) {
          return {
            ...existingChildGoal,
            children: [],
          } as HierarchicalGoal;
        }

        return {
          id: goal.id,
          district_id: district?.id || objective.district_id,
          school_id: null,
          plan_id: objective.plan_id,
          parent_id: objectiveId,
          goal_number: '',
          title: goal.data.title,
          description: goal.data.description || '',
          level: 1 as const,
          order_position: 0,
          created_at: '',
          updated_at: '',
          indicator_text: goal.data.indicator_text,
          indicator_color: goal.data.indicator_color,
          start_date: goal.data.start_date || undefined,
          end_date: goal.data.end_date || undefined,
          show_progress_bar: goal.data.show_progress_bar,
          is_public: goal.data.is_public,
          metrics: [],
          children: [],
        } as HierarchicalGoal;
      });

    return [
      {
        ...(objective as HierarchicalGoal),
        children: persistedLevel1Goals,
      },
    ];
  }, [childGoals, district?.id, level1Goals, objective, objectiveId]);

  // Loading state
  if (objectiveLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#10b981] mx-auto mb-3" />
          <p className="text-[#8a8a8a]">Loading objective...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (objectiveError || !objective) {
    return (
      <div className="min-h-screen bg-[#fafaf8]">
        <div className="px-10 py-8 max-w-[1100px]">
          <div className="bg-white border border-[#fee2e2] rounded-xl p-8 text-center">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">Objective not found</h2>
            <p className="text-[#8a8a8a] mb-4">The objective you're looking for doesn't exist or you don't have access to it.</p>
            <Link
              to={`/admin/objectives${location.search}`}
              className="inline-flex items-center gap-2 text-[#4a6fa5] hover:underline"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-6">
          <Link to={`/admin/objectives${location.search}`} className="hover:text-[#4a4a4a] transition-colors">
            All objectives
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1a1a1a]">Edit strategic objective</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight mb-2">
            Edit strategic objective
          </h1>
          <p className="text-[14px] text-[#6a6a6a]">
            Update your strategic objective and its associated goals. Changes will be saved when you click "Save Changes".
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main Form */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Title Field */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-6">
              <label className="block text-[15px] font-bold text-[#1a1a1a] mb-3">
                What is your strategic objective?
                <span className="ml-2 text-[12px] font-medium text-[#10b981]">(Title)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="e.g., Student Achievement & Well-being"
                className="w-full px-4 py-3 text-[14px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors"
              />
            </div>

            {/* Description Field */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-6">
              <label className="block text-[15px] font-bold text-[#1a1a1a] mb-3">
                Description
                <span className="ml-2 text-[12px] font-normal text-[#6a6a6a]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                placeholder="All students will learn in an environment where adults know their students..."
                rows={4}
                className="w-full px-4 py-3 text-[14px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors resize-none"
              />
              <div className="text-right text-[12px] text-[#8a8a8a] mt-1">
                {description.length} / 2000 characters
              </div>
            </div>

            {/* Goals Section - Enhanced with GoalEditor */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl overflow-hidden">
              <button
                onClick={() => setGoalsExpanded(!goalsExpanded)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#fafaf8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5 text-[#10b981]" />
                  <span className="text-[15px] font-bold text-[#1a1a1a]">Goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#8a8a8a] bg-[#f5f3ef] px-2 py-0.5 rounded">
                    {level1Goals.length} goals{subGoalCount > 0 ? ` • ${subGoalCount} sub-goals` : ''}
                  </span>
                  {goalsExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#8a8a8a]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#8a8a8a]" />
                  )}
                </div>
              </button>

              {goalsExpanded && (
                <div className="px-6 pb-6 border-t border-[#e8e6e1]">
                  <div className="mt-4 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] px-3 py-2 text-[12px] text-[#1d4ed8]">
                    Create and edit goals and sub-goals here. Sub-goals can be nested under saved level-1 goals.
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    {level1Goals.map((level1Goal) => {
                      const level1Index = goals.findIndex((goal) => goal.id === level1Goal.id);
                      const level2Goals = subGoalsByParent.get(level1Goal.id) || [];

                      return (
                        <div key={level1Goal.id} className="space-y-2">
                          <div className="flex items-center gap-3 px-4 py-3 bg-[#f8f9fb] border border-[#e5e8ed] rounded-lg group hover:border-[#dfe2e8] transition-colors">
                            <GripVertical className="h-4 w-4 text-[#d4d1cb] cursor-grab flex-shrink-0" />

                            <div className="w-10 h-10 flex items-center justify-center bg-[#d1fae5] rounded-md text-[#10b981] flex-shrink-0">
                              {level1Goal.metrics.length > 0 ? (
                                level1Goal.metrics[0].visualization_type === 'likert' ? (
                                  <BarChart3 className="h-5 w-5" />
                                ) : (
                                  <Hash className="h-5 w-5" />
                                )
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-[#10b981]" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#d1fae5] text-[#047857]">
                                  Goal
                                </span>
                                <div className="text-[14px] font-semibold text-[#1a1a1a] truncate">
                                  {level1Goal.data.title}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-[12px] text-[#8a8a8a]">
                                {level1Goal.metrics.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e5e8ed] rounded text-[10px] font-semibold uppercase tracking-wide">
                                    {level1Goal.metrics.length} metric{level1Goal.metrics.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {level1Goal.data.indicator_text && (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                                    style={{ backgroundColor: level1Goal.data.indicator_color }}
                                  >
                                    {level1Goal.data.indicator_text}
                                  </span>
                                )}
                                {level1Goal.isExisting && (
                                  <span className="text-[10px] text-[#8a8a8a]">
                                    (saved)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  if (!level1Goal.isExisting) return;
                                  setEditingGoalIndex(null);
                                  setPreferredParentId(level1Goal.id);
                                  setShowGoalEditor(true);
                                }}
                                disabled={!level1Goal.isExisting}
                                className="px-2.5 h-8 rounded text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 text-[#0f766e] bg-[#ccfbf1] hover:bg-[#99f6e4]"
                                title={level1Goal.isExisting ? 'Add Sub-goal' : 'Save first to add sub-goals'}
                              >
                                + Sub-goal
                              </button>
                              <button
                                onClick={() => handleEditGoal(level1Index)}
                                className="w-8 h-8 flex items-center justify-center rounded text-[#8a8a8a] hover:bg-[#e5e8ed] hover:text-[#5c6578] transition-colors"
                                title="Edit Goal"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveGoal(level1Index)}
                                className="w-8 h-8 flex items-center justify-center rounded text-[#8a8a8a] hover:bg-[#fee2e2] hover:text-[#ef4444] transition-colors"
                                title="Delete Goal"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {level2Goals.map((subGoal) => {
                            const subGoalIndex = goals.findIndex((goal) => goal.id === subGoal.id);

                            return (
                              <div
                                key={subGoal.id}
                                className="ml-8 flex items-center gap-3 px-4 py-3 bg-white border border-[#e5e8ed] rounded-lg group hover:border-[#dfe2e8] transition-colors"
                              >
                                <div className="w-9 h-9 flex items-center justify-center bg-[#f0fdf4] rounded-md text-[#15803d] flex-shrink-0">
                                  {subGoal.metrics.length > 0 ? (
                                    subGoal.metrics[0].visualization_type === 'likert' ? (
                                      <BarChart3 className="h-4 w-4" />
                                    ) : (
                                      <Hash className="h-4 w-4" />
                                    )
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-[#15803d]" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#dcfce7] text-[#166534]">
                                      Sub-goal
                                    </span>
                                    <div className="text-[13px] font-semibold text-[#1a1a1a] truncate">
                                      {subGoal.data.title}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-[12px] text-[#8a8a8a]">
                                    {subGoal.metrics.length > 0 && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e5e8ed] rounded text-[10px] font-semibold uppercase tracking-wide">
                                        {subGoal.metrics.length} metric{subGoal.metrics.length !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {subGoal.data.indicator_text && (
                                      <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                                        style={{ backgroundColor: subGoal.data.indicator_color }}
                                      >
                                        {subGoal.data.indicator_text}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEditGoal(subGoalIndex)}
                                    className="w-8 h-8 flex items-center justify-center rounded text-[#8a8a8a] hover:bg-[#e5e8ed] hover:text-[#5c6578] transition-colors"
                                    title="Edit Sub-goal"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveGoal(subGoalIndex)}
                                    className="w-8 h-8 flex items-center justify-center rounded text-[#8a8a8a] hover:bg-[#fee2e2] hover:text-[#ef4444] transition-colors"
                                    title="Delete Sub-goal"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Add Goal Button */}
                    <button
                      onClick={() => {
                        setEditingGoalIndex(null);
                        setPreferredParentId(objectiveId || null);
                        setShowGoalEditor(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-[#e8e6e1] rounded-lg text-[13px] font-medium text-[#8a8a8a] hover:border-[#10b981] hover:text-[#10b981] hover:bg-[#f0fdf4] transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Goal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Badge Section */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-[#10b981]" />
                  <span className="text-[15px] font-bold text-[#1a1a1a]">Visual Badge</span>
                </div>
                <button
                  onClick={() => setShowVisualBadge(!showVisualBadge)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showVisualBadge ? 'bg-[#10b981]' : 'bg-[#d4d1cb]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      showVisualBadge ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {showVisualBadge && (
                <>
                  {/* Badge Type Selection */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['on-target', 'needs-attention', 'off-target'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleBadgeTypeChange(type)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border-2 text-[12px] font-semibold transition-all ${
                          badgeType === type
                            ? type === 'on-target'
                              ? 'bg-[#d1fae5] text-[#059669] border-[#10b981]'
                              : type === 'needs-attention'
                              ? 'bg-[#fef3c7] text-[#b45309] border-[#f59e0b]'
                              : 'bg-[#fee2e2] text-[#dc2626] border-[#ef4444]'
                            : 'bg-transparent border-[#e8e6e1] text-[#6a6a6a] hover:bg-[#f8f9fb]'
                        }`}
                      >
                        {badgeType === type && <Check className="h-3 w-3" />}
                        {type === 'on-target' && 'On Target'}
                        {type === 'needs-attention' && 'Needs Attention'}
                        {type === 'off-target' && 'Off Target'}
                      </button>
                    ))}
                  </div>

                  {/* Custom Badge Text */}
                  <div className="mb-4">
                    <label className="block text-[12px] text-[#6a6a6a] mb-1.5">Custom Badge Text</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customBadgeText}
                        onChange={(e) => setCustomBadgeText(e.target.value)}
                        className="flex-1 px-3 py-2 text-[14px] border border-[#e8e6e1] rounded-lg focus:outline-none focus:border-[#10b981]"
                      />
                      <div className="flex gap-1 p-1 border border-[#e8e6e1] rounded-lg">
                        {colorPresets.map((color) => (
                          <button
                            key={color.hex}
                            onClick={() => setBadgeColor(color.hex)}
                            className={`w-7 h-7 rounded ${
                              badgeColor === color.hex ? 'ring-2 ring-offset-1 ring-[#1a1a1a]' : ''
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Badge Preview */}
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#6a6a6a]">Preview:</span>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-white"
                      style={{ backgroundColor: badgeColor }}
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      {customBadgeText}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Progress Bar Section */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[#10b981]" />
                  <div>
                    <span className="text-[15px] font-bold text-[#1a1a1a]">Progress Bar</span>
                    <p className="text-[12px] text-[#6a6a6a]">Display an overall progress indicator</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProgressBar(!showProgressBar)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showProgressBar ? 'bg-[#10b981]' : 'bg-[#d4d1cb]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      showProgressBar ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Visibility Section */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-6">
              <label className="block text-[15px] font-bold text-[#1a1a1a] mb-1">
                Who can see this strategic objective?
              </label>
              <p className="text-[13px] text-[#6a6a6a] mb-4">
                Public objectives are visible on your district's public dashboard.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibility('public')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-[13px] font-medium transition-all ${
                    visibility === 'public'
                      ? 'border-[#10b981] bg-[#f0fdf4] text-[#059669]'
                      : 'border-[#e8e6e1] text-[#6a6a6a] hover:bg-[#fafaf8]'
                  }`}
                >
                  {visibility === 'public' && <Check className="h-3.5 w-3.5" />}
                  <Globe className="h-4 w-4" />
                  Public
                </button>
                <button
                  onClick={() => setVisibility('private')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-[13px] font-medium transition-all ${
                    visibility === 'private'
                      ? 'border-[#10b981] bg-[#f0fdf4] text-[#059669]'
                      : 'border-[#e8e6e1] text-[#6a6a6a] hover:bg-[#fafaf8]'
                  }`}
                >
                  {visibility === 'private' && <Check className="h-3.5 w-3.5" />}
                  <Lock className="h-4 w-4" />
                  Private
                </button>
              </div>
            </div>

            {/* Date Range Section */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-6">
              <label className="block text-[15px] font-bold text-[#1a1a1a] mb-4">
                When does this strategic objective start and end?
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {formError && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b91c1c]">
                {formError}
              </div>
            )}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => navigate('/admin/objectives' + location.search)}
                className="px-6 py-2.5 text-[14px] font-medium text-[#4a4a4a] bg-[#f5f3ef] rounded-lg hover:bg-[#e8e6e1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-[14px] font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] flex-shrink-0">
            <div className="bg-[#f0fdf4] border border-[#d1fae5] rounded-xl p-5 sticky top-8">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="h-5 w-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Editing Tips</h3>
              </div>
              <p className="text-[13px] text-[#4a4a4a] leading-relaxed">
                You can update objective details and directly create, edit, or remove goals and sub-goals in this page.
                Use "Add Goal" for level-1 goals and "+ Sub-goal" from a saved goal card.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Editor Slideover */}
      <SlideoverPanel
        isOpen={showGoalEditor}
        onClose={() => {
          setShowGoalEditor(false);
          setEditingGoalIndex(null);
          setPreferredParentId(null);
        }}
        title={editingGoalIndex !== null ? 'Edit Goal' : 'Add New Goal'}
        subtitle={`Under: ${title || 'Objective'}`}
        icon={
          <div className="w-10 h-10 flex items-center justify-center bg-[#d1fae5] rounded-lg">
            <Target className="h-5 w-5 text-[#10b981]" />
          </div>
        }
        width="xl"
      >
        {showGoalEditor && (
          <GoalEditor
            parentObjectiveId={preferredParentId || objectiveId}
            parentObjectiveTitle={title || 'Objective'}
            existingGoals={parentSelectionGoals}
            existingGoal={
              editingGoalIndex !== null
                ? {
                    id: goals[editingGoalIndex].id,
                    district_id: district?.id || '',
                    parent_id: goals[editingGoalIndex].data.parent_id || objectiveId || null,
                    goal_number: '',
                    title: goals[editingGoalIndex].data.title,
                    description: goals[editingGoalIndex].data.description,
                    level: goals[editingGoalIndex].level,
                    order_position: editingGoalIndex,
                    created_at: '',
                    updated_at: '',
                    indicator_text: goals[editingGoalIndex].data.indicator_text,
                    indicator_color: goals[editingGoalIndex].data.indicator_color,
                    start_date: goals[editingGoalIndex].data.start_date,
                    end_date: goals[editingGoalIndex].data.end_date,
                    show_progress_bar: goals[editingGoalIndex].data.show_progress_bar,
                    is_public: goals[editingGoalIndex].data.is_public,
                    metrics: goals[editingGoalIndex].metrics.map((m, i) => ({
                      id: m.id || `temp-${i}`,
                      goal_id: goals[editingGoalIndex].id,
                      district_id: district?.id || '',
                      metric_name: m.name,
                      name: m.name,
                      description: m.description,
                      metric_type: m.metric_type,
                      current_value: m.current_value ?? undefined,
                      target_value: m.target_value ?? undefined,
                      unit: m.unit,
                      visualization_type: m.visualization_type,
                      visualization_config: m.visualization_config,
                      frequency: 'quarterly',
                      aggregation_method: 'latest',
                    })),
                  }
                : undefined
            }
            onSave={async (goalData, metrics) => {
              await handleSaveGoal(goalData, metrics);
              setShowGoalEditor(false);
              setEditingGoalIndex(null);
              setPreferredParentId(null);
            }}
            onCancel={() => {
              setShowGoalEditor(false);
              setEditingGoalIndex(null);
              setPreferredParentId(null);
            }}
          />
        )}
      </SlideoverPanel>

      <ConfirmDialog
        isOpen={!!goalPendingDelete}
        onClose={() => setGoalPendingDelete(null)}
        onConfirm={() => {
          if (!goalPendingDelete) return;
          setGoals((previousGoals) =>
            previousGoals.filter(
              (goal) =>
                goal.id !== goalPendingDelete.id &&
                goal.data.parent_id !== goalPendingDelete.id,
            ),
          );
          toast.info('Goal and its sub-goals removed from this draft. Save changes to persist.');
        }}
        title="Delete goal and sub-goals?"
        message={
          goalPendingDelete
            ? `"${goalPendingDelete.data.title}" has nested sub-goals. Deleting it will also remove all nested sub-goals from this objective.`
            : ''
        }
        confirmText="Delete Goal & Sub-goals"
        cancelText="Keep Goal"
        variant="danger"
      />
    </div>
  );
}
