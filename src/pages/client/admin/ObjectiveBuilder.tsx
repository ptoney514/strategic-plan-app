import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Flag,
  AlertCircle,
  ChevronRight,
  Eye,
  Save,
  X,
  TrendingUp,
  Edit2
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { OverallProgressBar } from '../../../components/OverallProgressBar';
import { GoalsService } from '../../../lib/services/goals.service';
import { MetricsService } from '../../../lib/services/metrics.service';
import type { Goal, Metric } from '../../../lib/types';
import { MetricBuilderWizard } from '../../../components/MetricBuilderWizard';
import { GoalBuilder } from '../../../components/GoalBuilder';
import { useUpdateMetric, useDeleteMetric } from '../../../hooks/useMetrics';

interface ComponentItem {
  id: string;
  type: 'goal' | 'metric' | 'property';
  icon: React.ReactNode;
  label: string;
  description: string;
  category: string;
}

interface GoalWithChildren extends Partial<Goal> {
  children?: GoalWithChildren[];
}

interface BuilderState {
  objective: Partial<Goal>;
  goals: GoalWithChildren[];
  activeSlot: 'basic' | 'visual' | 'goals' | 'metrics' | 'properties' | null;
  visibleComponents: {
    title: boolean;
    description: boolean;
    cardColor: boolean;
    cardImage: boolean;
    progressBar: boolean;
    visualBadge: boolean;
  };
}

const AVAILABLE_COMPONENTS: ComponentItem[] = [
  // Goals only - objective fields are now inline
  { id: 'new_goal', type: 'goal', icon: <Target size={20} />, label: 'Add Goal', description: 'Add a sub-goal', category: 'Goals' },
];

export function ObjectiveBuilder() {
  const { slug, objectiveId, goalId } = useParams();
  const navigate = useNavigate();
  const { data: district } = useDistrict(slug!);

  // Determine what we're editing: objectiveId for level 0, goalId for level 1+
  const editingId = objectiveId || goalId;
  const isEditMode = !!editingId;
  const isEditingObjective = !!objectiveId; // true if editing via /objectives/:id/edit route

  const [editingLevel, setEditingLevel] = useState<0 | 1 | 2>(0);
  const [builderState, setBuilderState] = useState<BuilderState>({
    objective: {
      title: '',
      description: '',
      level: 0,
    },
    goals: [],
    activeSlot: null,
    visibleComponents: {
      title: true,
      description: true,
      cardColor: true,
      cardImage: true,
      progressBar: true,
      visualBadge: true,
    },
  });
  const [activeTab, setActiveTab] = useState<'objective' | 'goals'>('objective');
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    objectiveTitle?: string;
    objectiveDescription?: string;
    goals?: { [key: number]: string };
  }>({});

  const categories = [...new Set(AVAILABLE_COMPONENTS.map(c => c.category))];

  // Dynamic labels based on editing level
  const entityLabel = editingLevel === 0 ? 'Strategic Objective' : editingLevel === 1 ? 'Goal' : 'Sub-Goal';
  const entityLabelLower = entityLabel.toLowerCase();
  const childLabel = editingLevel === 0 ? 'Goals' : 'Sub-Goals';
  const childLabelSingular = editingLevel === 0 ? 'Goal' : 'Sub-Goal';
  const canHaveChildren = editingLevel < 2; // Level 2 (sub-goals) cannot have children

  // Real-time validation
  const validateObjectiveTitle = (title: string) => {
    if (!title.trim()) {
      return 'Title is required';
    }
    if (title.trim().length < 3) {
      return 'Title must be at least 3 characters';
    }
    if (title.trim().length > 200) {
      return 'Title must be less than 200 characters';
    }
    return undefined;
  };

  const validateObjectiveDescription = (description: string) => {
    if (description && description.length > 2000) {
      return 'Description must be less than 2000 characters';
    }
    return undefined;
  };

  const validateGoalTitle = (title: string) => {
    if (!title.trim()) {
      return 'Goal title is required';
    }
    if (title.trim().length < 3) {
      return 'Goal title must be at least 3 characters';
    }
    if (title.trim().length > 200) {
      return 'Goal title must be less than 200 characters';
    }
    return undefined;
  };

  // Load goal data in edit mode (works for any level)
  useEffect(() => {
    if (isEditMode && editingId) {
      setIsLoading(true);
      Promise.all([
        GoalsService.getById(editingId),
        GoalsService.getChildren(editingId)
      ])
        .then(async ([goal, children]) => {
          if (goal) {
            // If we're editing a level 1+ goal via /goals/:goalId/edit route,
            // redirect to edit the parent objective instead
            if (goalId && goal.level > 0 && goal.parent_id) {
              navigate(`/${slug}/admin/objectives/${goal.parent_id}/edit`, { replace: true });
              return;
            }

            // Set the editing level based on the loaded goal
            setEditingLevel(goal.level as 0 | 1 | 2);

            // Fetch sub-goals (level 2) for each level 1 goal
            const goalsWithChildren: GoalWithChildren[] = [];
            if (children && children.length > 0) {
              const metricsMap: Record<string, Metric[]> = {};

              for (const child of children) {
                // Fetch metrics for this goal
                const metrics = await MetricsService.getByGoal(child.id);
                metricsMap[child.id] = metrics;

                // Fetch sub-goals (children) for this level 1 goal
                const subGoals = await GoalsService.getChildren(child.id);

                // Fetch metrics for each sub-goal
                if (subGoals && subGoals.length > 0) {
                  for (const subGoal of subGoals) {
                    const subGoalMetrics = await MetricsService.getByGoal(subGoal.id);
                    metricsMap[subGoal.id] = subGoalMetrics;
                  }
                }

                goalsWithChildren.push({
                  ...child,
                  children: subGoals || []
                });
              }
              setGoalMetrics(metricsMap);
            }

            setBuilderState(prev => ({
              ...prev,
              objective: goal,
              goals: goalsWithChildren,
              visibleComponents: {
                title: !!goal.title,
                description: !!goal.description,
                cardImage: !!(goal.image_url || goal.header_color),
                progressBar: goal.show_progress_bar !== false, // default to true if not set
                visualBadge: !!(goal.indicator_text), // default to false if not set
                cardColor: true,
              }
            }));
          }
        })
        .catch(error => {
          console.error('Error loading goal:', error);
          alert('Failed to load goal');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEditMode, editingId, goalId, navigate, slug]);

  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [propertyValue, setPropertyValue] = useState<string>('');

  const addProperty = (componentId: string) => {
    setEditingProperty(componentId);
    // Pre-fill with existing value if editing
    if (componentId === 'title') setPropertyValue(builderState.objective.title || '');
    if (componentId === 'description') setPropertyValue(builderState.objective.description || '');
    if (componentId === 'executive_summary') setPropertyValue(builderState.objective.executive_summary || '');
    if (componentId === 'image_url') setPropertyValue(builderState.objective.image_url || '');
    if (componentId === 'header_color') setPropertyValue(builderState.objective.header_color || '#3b82f6');
    if (componentId === 'owner') setPropertyValue(builderState.objective.owner_name || '');
    if (componentId === 'department') setPropertyValue(builderState.objective.department || '');
    if (componentId === 'dates') setPropertyValue(builderState.objective.start_date || '');
    if (componentId === 'priority') setPropertyValue(builderState.objective.priority || 'medium');
    if (componentId === 'progress_display') {
      setPropertyValue(builderState.objective.overall_progress_display_mode || 'percentage');
      // Custom value is managed separately in the state, no need to set it in propertyValue
    }
  };

  const [endDate, setEndDate] = useState<string>('');

  const saveProperty = () => {
    if (!editingProperty) return;

    // Check if we're editing from within the goal modal
    if (showGoalModal) {
      console.log('Saving progress display mode from goal modal:', propertyValue);
      // Update goalForm instead of builderState
      if (editingProperty === 'progress_display') {
        setGoalForm(prev => ({
          ...prev,
          overall_progress_display_mode: propertyValue as any,
          overall_progress_custom_value: propertyValue !== 'custom' ? '' : prev.overall_progress_custom_value
        }));
      }
      setEditingProperty(null);
      setPropertyValue('');
      return;
    }

    const updates: Partial<Goal> = {};

    // Map component IDs to objective properties
    if (editingProperty === 'title') updates.title = propertyValue;
    if (editingProperty === 'description') updates.description = propertyValue;
    if (editingProperty === 'executive_summary') updates.executive_summary = propertyValue;
    if (editingProperty === 'image_url') updates.image_url = propertyValue;
    if (editingProperty === 'header_color') updates.header_color = propertyValue;
    if (editingProperty === 'owner') updates.owner_name = propertyValue;
    if (editingProperty === 'department') updates.department = propertyValue;
    if (editingProperty === 'priority') updates.priority = propertyValue as any;
    if (editingProperty === 'progress_display') {
      updates.overall_progress_display_mode = propertyValue as any;
      // If switching away from custom mode, clear the custom value
      if (propertyValue !== 'custom') {
        updates.overall_progress_custom_value = undefined;
      }
    }
    if (editingProperty === 'dates') {
      updates.start_date = propertyValue;
      updates.end_date = endDate;
    }

    setBuilderState(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        ...updates
      }
    }));

    setEditingProperty(null);
    setPropertyValue('');
    setEndDate('');
  };

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [editingSubGoalParentIndex, setEditingSubGoalParentIndex] = useState<number | null>(null); // Track parent goal when adding/editing sub-goal
  const [editingSubGoalIndex, setEditingSubGoalIndex] = useState<number | null>(null); // Track sub-goal index within parent
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    indicator_text: '',
    indicator_color: '#10b981',
    metrics: [] as any[],
    show_progress_bar: true,
    overall_progress_display_mode: 'percentage' as 'percentage' | 'qualitative' | 'custom',
    overall_progress_custom_value: '',
    overall_progress_override: undefined as number | undefined
  });
  const [goalFormError, setGoalFormError] = useState<string | undefined>(undefined);

  // Metric wizard state
  const [showMetricWizard, setShowMetricWizard] = useState(false);
  const [currentGoalForMetric, setCurrentGoalForMetric] = useState<{idx: number; id: string; goal_number: string} | null>(null);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [goalMetrics, setGoalMetrics] = useState<Record<string, Metric[]>>({});

  const updateMetricMutation = useUpdateMetric();
  const deleteMetricMutation = useDeleteMetric();

  const addGoal = () => {
    setEditingGoalIndex(null);
    setGoalForm({
      title: '',
      description: '',
      indicator_text: '',
      indicator_color: '#10b981',
      metrics: [],
      show_progress_bar: true,
      overall_progress_display_mode: 'percentage',
      overall_progress_custom_value: '',
      overall_progress_override: undefined
    });
    setGoalFormError(undefined);
    setShowGoalModal(true);
  };

  const editGoal = (index: number) => {
    const goal = builderState.goals[index];
    setEditingGoalIndex(index);
    setGoalForm({
      title: goal.title || '',
      description: goal.description || '',
      indicator_text: goal.indicator_text || '',
      indicator_color: goal.indicator_color || '#10b981',
      metrics: (goal as any).metrics || [],
      show_progress_bar: goal.show_progress_bar !== false,
      overall_progress_display_mode: goal.overall_progress_display_mode || 'percentage',
      overall_progress_custom_value: goal.overall_progress_custom_value || '',
      overall_progress_override: goal.overall_progress_override
    });
    setShowGoalModal(true);
  };

  const saveGoal = () => {
    if (!goalForm.title.trim()) return;

    // Check if we're editing a sub-goal
    if (editingSubGoalParentIndex !== null) {
      if (editingSubGoalIndex !== null) {
        // Update existing sub-goal
        setBuilderState(prev => ({
          ...prev,
          goals: prev.goals.map((g, i) => {
            if (i === editingSubGoalParentIndex) {
              return {
                ...g,
                children: g.children?.map((sg, si) => si === editingSubGoalIndex ? {
                  ...sg,
                  title: goalForm.title,
                  description: goalForm.description,
                  indicator_text: goalForm.indicator_text,
                  indicator_color: goalForm.indicator_color,
                  show_progress_bar: goalForm.show_progress_bar,
                  overall_progress_display_mode: goalForm.overall_progress_display_mode,
                  overall_progress_custom_value: goalForm.overall_progress_custom_value,
                  overall_progress_override: goalForm.overall_progress_override
                } : sg)
              };
            }
            return g;
          })
        }));
      } else {
        // Add new sub-goal
        setBuilderState(prev => ({
          ...prev,
          goals: prev.goals.map((g, i) => {
            if (i === editingSubGoalParentIndex) {
              const subGoalNumber = (g.children?.length || 0) + 1;
              return {
                ...g,
                children: [
                  ...(g.children || []),
                  {
                    title: goalForm.title,
                    description: goalForm.description,
                    indicator_text: goalForm.indicator_text,
                    indicator_color: goalForm.indicator_color,
                    level: 2,
                    parent_id: g.id,
                    goal_number: `${g.goal_number}.${subGoalNumber}`,
                    show_progress_bar: goalForm.show_progress_bar,
                    overall_progress_display_mode: goalForm.overall_progress_display_mode,
                    overall_progress_custom_value: goalForm.overall_progress_custom_value,
                    overall_progress_override: goalForm.overall_progress_override
                  }
                ]
              };
            }
            return g;
          })
        }));
      }
      setEditingSubGoalParentIndex(null);
      setEditingSubGoalIndex(null);
    } else if (editingGoalIndex !== null) {
      // Update existing goal
      setBuilderState(prev => ({
        ...prev,
        goals: prev.goals.map((g, i) => i === editingGoalIndex ? {
          ...g,
          title: goalForm.title,
          description: goalForm.description,
          indicator_text: goalForm.indicator_text,
          indicator_color: goalForm.indicator_color,
          show_progress_bar: goalForm.show_progress_bar,
          overall_progress_display_mode: goalForm.overall_progress_display_mode,
          overall_progress_custom_value: goalForm.overall_progress_custom_value,
          overall_progress_override: goalForm.overall_progress_override
        } : g)
      }));
    } else {
      // Add new goal
      setBuilderState(prev => ({
        ...prev,
        goals: [...prev.goals, {
          title: goalForm.title,
          description: goalForm.description,
          indicator_text: goalForm.indicator_text,
          indicator_color: goalForm.indicator_color,
          level: 1,
          parent_id: prev.objective.id,
          goal_number: prev.objective.goal_number
            ? `${prev.objective.goal_number}.${prev.goals.length + 1}`
            : `${prev.goals.length + 1}`,
          show_progress_bar: goalForm.show_progress_bar,
          overall_progress_display_mode: goalForm.overall_progress_display_mode,
          overall_progress_custom_value: goalForm.overall_progress_custom_value,
          overall_progress_override: goalForm.overall_progress_override,
          children: []
        }]
      }));
    }

    setShowGoalModal(false);
    setEditingGoalIndex(null);
  };

  const removeGoal = (index: number) => {
    setBuilderState(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  // Sub-goal management functions
  const addSubGoal = (parentGoalIndex: number) => {
    setEditingSubGoalParentIndex(parentGoalIndex);
    setEditingSubGoalIndex(null);
    setEditingGoalIndex(null);
    setGoalForm({
      title: '',
      description: '',
      indicator_text: '',
      indicator_color: '#10b981',
      metrics: [],
      show_progress_bar: true,
      overall_progress_display_mode: 'percentage',
      overall_progress_custom_value: '',
      overall_progress_override: undefined
    });
    setGoalFormError(undefined);
    setShowGoalModal(true);
  };

  const editSubGoal = (parentGoalIndex: number, subGoalIndex: number) => {
    const parentGoal = builderState.goals[parentGoalIndex];
    const subGoal = parentGoal.children?.[subGoalIndex];
    if (!subGoal) return;

    setEditingSubGoalParentIndex(parentGoalIndex);
    setEditingSubGoalIndex(subGoalIndex);
    setEditingGoalIndex(null);
    setGoalForm({
      title: subGoal.title || '',
      description: subGoal.description || '',
      indicator_text: subGoal.indicator_text || '',
      indicator_color: subGoal.indicator_color || '#10b981',
      metrics: (subGoal as any).metrics || [],
      show_progress_bar: subGoal.show_progress_bar !== false,
      overall_progress_display_mode: subGoal.overall_progress_display_mode || 'percentage',
      overall_progress_custom_value: subGoal.overall_progress_custom_value || '',
      overall_progress_override: subGoal.overall_progress_override
    });
    setShowGoalModal(true);
  };

  const removeSubGoal = (parentGoalIndex: number, subGoalIndex: number) => {
    setBuilderState(prev => ({
      ...prev,
      goals: prev.goals.map((g, i) => {
        if (i === parentGoalIndex) {
          return {
            ...g,
            children: g.children?.filter((_, si) => si !== subGoalIndex) || []
          };
        }
        return g;
      })
    }));
  };

  const toggleComponent = (componentKey: keyof BuilderState['visibleComponents']) => {
    setBuilderState(prev => ({
      ...prev,
      visibleComponents: {
        ...prev.visibleComponents,
        [componentKey]: !prev.visibleComponents[componentKey]
      }
    }));
  };

  const handleSaveAndPublish = async () => {
    // Validate district
    if (!district?.id) {
      alert('Error: District not found. Please refresh and try again.');
      return;
    }

    // Validate required fields
    if (!builderState.objective.title?.trim()) {
      alert(`Validation Error: Please enter a ${entityLabelLower} title`);
      return;
    }

    // Validate title length
    if (builderState.objective.title.trim().length < 3) {
      alert(`Validation Error: ${entityLabel} title must be at least 3 characters long`);
      return;
    }

    if (builderState.objective.title.trim().length > 200) {
      alert(`Validation Error: ${entityLabel} title must be less than 200 characters`);
      return;
    }

    // Validate description length if provided
    if (builderState.objective.description && builderState.objective.description.length > 2000) {
      alert('Validation Error: Description must be less than 2000 characters');
      return;
    }

    // Validate child goals/sub-goals
    for (let i = 0; i < builderState.goals.length; i++) {
      const goal = builderState.goals[i];
      if (!goal.title?.trim()) {
        alert(`Validation Error: ${childLabelSingular} ${i + 1} is missing a title`);
        return;
      }
      if (goal.title.trim().length < 3) {
        alert(`Validation Error: ${childLabelSingular} ${i + 1} title must be at least 3 characters long`);
        return;
      }
      if (goal.title.trim().length > 200) {
        alert(`Validation Error: ${childLabelSingular} ${i + 1} title must be less than 200 characters`);
        return;
      }
    }

    setIsSaving(true);
    try {
      let savedObjective: Goal;

      const objectiveData: Partial<Goal> = {
        district_id: district.id,
        title: builderState.objective.title.trim(),
        description: builderState.objective.description?.trim() || null,
        level: editingLevel, // Dynamic level based on what we're editing
        parent_id: editingLevel === 0 ? null : builderState.objective.parent_id, // Preserve parent for non-objectives
        image_url: builderState.objective.image_url || null,
        header_color: builderState.objective.header_color || null,
        show_progress_bar: builderState.visibleComponents.progressBar,
        indicator_text: builderState.visibleComponents.visualBadge ? (builderState.objective.indicator_text?.trim() || null) : null,
        indicator_color: builderState.visibleComponents.visualBadge ? (builderState.objective.indicator_color || '#10b981') : null,
        overall_progress: builderState.objective.overall_progress || 0,
        overall_progress_display_mode: builderState.objective.overall_progress_display_mode || 'percentage',
        overall_progress_custom_value: builderState.objective.overall_progress_custom_value || null,
        owner_name: builderState.objective.owner_name || null,
        department: builderState.objective.department || null,
        start_date: builderState.objective.start_date || null,
        end_date: builderState.objective.end_date || null,
        priority: builderState.objective.priority || null,
        executive_summary: builderState.objective.executive_summary || null,
      };

      if (isEditMode && editingId) {
        // UPDATE existing goal (at any level)
        savedObjective = await GoalsService.update(editingId, objectiveData);
        console.log(`Updated ${entityLabelLower}:`, savedObjective);

        // NON-DESTRUCTIVE child handling: update existing, create new, delete removed
        const existingChildren = await GoalsService.getChildren(editingId);
        const existingChildIds = existingChildren.map(c => c.id);
        const currentChildIds = builderState.goals.filter(g => g.id).map(g => g.id!);

        // Find children that were removed from the UI (exist in DB but not in current state)
        const childrenToDelete = existingChildIds.filter(id => !currentChildIds.includes(id));
        for (const childId of childrenToDelete) {
          console.log(`Deleting removed child: ${childId}`);
          await GoalsService.delete(childId);
        }
      } else {
        // CREATE new goal (at any level)
        savedObjective = await GoalsService.create(objectiveData);
        console.log(`Created ${entityLabelLower}:`, savedObjective);
      }

      // Update existing children or create new ones (NON-DESTRUCTIVE)
      const childLevel = (editingLevel + 1) as 1 | 2;
      for (const goal of builderState.goals) {
        const goalData: Partial<Goal> = {
          district_id: district.id,
          title: goal.title!.trim(),
          description: goal.description?.trim() || null,
          indicator_text: goal.indicator_text || null,
          indicator_color: goal.indicator_color || null,
          show_progress_bar: goal.show_progress_bar !== false,
          overall_progress: goal.overall_progress_override || goal.overall_progress || 0,
          overall_progress_override: goal.overall_progress_override,
          overall_progress_display_mode: goal.overall_progress_display_mode || 'percentage',
          overall_progress_custom_value: goal.overall_progress_custom_value || null,
          level: childLevel, // Dynamic based on parent level
          parent_id: savedObjective.id,
        };

        let savedGoal: Goal;
        if (goal.id) {
          // UPDATE existing child goal - preserves ID, metrics, and all data
          console.log(`Updating existing ${childLabelSingular.toLowerCase()}: ${goal.id}`);
          savedGoal = await GoalsService.update(goal.id, goalData);
        } else {
          // CREATE new child goal
          console.log(`Creating new ${childLabelSingular.toLowerCase()}`);
          savedGoal = await GoalsService.create(goalData);
        }

        // Handle sub-goals (level 2) if this is a level 1 goal
        if (childLevel === 1 && goal.children && goal.children.length > 0) {
          // Get existing sub-goals from database
          const existingSubGoals = goal.id ? await GoalsService.getChildren(goal.id) : [];
          const existingSubGoalIds = existingSubGoals.map(sg => sg.id);
          const currentSubGoalIds = goal.children.filter(sg => sg.id).map(sg => sg.id!);

          // Delete removed sub-goals
          const subGoalsToDelete = existingSubGoalIds.filter(id => !currentSubGoalIds.includes(id));
          for (const subGoalId of subGoalsToDelete) {
            console.log(`Deleting removed sub-goal: ${subGoalId}`);
            await GoalsService.delete(subGoalId);
          }

          // Save each sub-goal
          for (const subGoal of goal.children) {
            const subGoalData: Partial<Goal> = {
              district_id: district.id,
              title: subGoal.title!.trim(),
              description: subGoal.description?.trim() || null,
              indicator_text: subGoal.indicator_text || null,
              indicator_color: subGoal.indicator_color || null,
              show_progress_bar: subGoal.show_progress_bar !== false,
              overall_progress: subGoal.overall_progress_override || subGoal.overall_progress || 0,
              overall_progress_override: subGoal.overall_progress_override,
              overall_progress_display_mode: subGoal.overall_progress_display_mode || 'percentage',
              overall_progress_custom_value: subGoal.overall_progress_custom_value || null,
              level: 2,
              parent_id: savedGoal.id,
            };

            if (subGoal.id) {
              console.log(`Updating existing sub-goal: ${subGoal.id}`);
              await GoalsService.update(subGoal.id, subGoalData);
            } else {
              console.log(`Creating new sub-goal`);
              await GoalsService.create(subGoalData);
            }
          }
        }
      }

      alert(isEditMode ? `${entityLabel} updated successfully!` : `${entityLabel} created successfully!`);
      navigate(`/${slug}/admin/goals`);
    } catch (error) {
      console.error('Error saving objective:', error);

      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate')) {
          alert('Error: An objective with this information already exists.');
        } else if (error.message.includes('permission')) {
          alert('Error: You do not have permission to save this objective.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Failed to save objective. Please check your connection and try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderCenterCanvas = () => {
    const { objective } = builderState;

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground">
              {editingLevel === 0 ? 'Strategic Objective Builder' :
               `${entityLabel} Editor${builderState.objective.goal_number ? ` - ${builderState.objective.goal_number}` : ''}`}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {editingLevel === 0
                ? 'Create your strategic objective and add goals'
                : `Edit ${entityLabelLower} details and manage ${childLabel.toLowerCase()}`}
            </p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Objective Card Preview */}
            <div className="border-2 border-dashed border-border rounded-lg bg-white">
              {/* Header Section */}
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Strategic Objective</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title - Inline Editable */}
                {builderState.visibleComponents.title && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      OBJECTIVE TITLE *
                    </label>
                    <input
                      type="text"
                      value={objective.title || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setBuilderState(prev => ({
                          ...prev,
                          objective: { ...prev.objective, title: newTitle }
                        }));
                        // Validate and update errors
                        const error = validateObjectiveTitle(newTitle);
                        setValidationErrors(prev => ({
                          ...prev,
                          objectiveTitle: error
                        }));
                      }}
                      placeholder="Enter strategic objective title..."
                      className={`w-full text-2xl font-bold text-foreground bg-transparent border-0 border-b-2 ${
                        validationErrors.objectiveTitle
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-transparent hover:border-muted focus:border-primary'
                      } focus:outline-none px-0 py-2 transition-colors`}
                    />
                    {validationErrors.objectiveTitle && (
                      <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.objectiveTitle}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {objective.title?.length || 0} / 200 characters
                    </p>
                  </div>
                )}

                {/* Description - Inline Editable */}
                {builderState.visibleComponents.description && (
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      DESCRIPTION
                    </label>
                    <textarea
                      value={objective.description || ''}
                      onChange={(e) => {
                        const newDescription = e.target.value;
                        setBuilderState(prev => ({
                          ...prev,
                          objective: { ...prev.objective, description: newDescription }
                        }));
                        // Validate and update errors
                        const error = validateObjectiveDescription(newDescription);
                        setValidationErrors(prev => ({
                          ...prev,
                          objectiveDescription: error
                        }));
                      }}
                      placeholder="Enter a detailed description of this strategic objective..."
                      rows={3}
                      className={`w-full text-sm text-muted-foreground bg-transparent border-2 ${
                        validationErrors.objectiveDescription
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-transparent hover:border-muted focus:border-primary'
                      } focus:outline-none px-3 py-2 rounded-md resize-none transition-colors`}
                    />
                    {validationErrors.objectiveDescription && (
                      <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.objectiveDescription}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {objective.description?.length || 0} / 2000 characters
                    </p>
                  </div>
                )}

                {/* Progress Bar Preview */}
                {builderState.visibleComponents.progressBar && (
                  <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-muted-foreground">
                        OVERALL PROGRESS (Preview)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {objective.overall_progress_display_mode === 'custom' && objective.overall_progress_custom_value
                            ? `Displays: "${objective.overall_progress_custom_value}" (Bar: ${Math.round(objective.overall_progress || 0)}%)`
                            : `${Math.round(objective.overall_progress || 0)}%`
                          }
                        </span>
                        <button
                          onClick={() => addProperty('progress_display')}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Configure display mode"
                        >
                          <Edit2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <OverallProgressBar
                      goal={{
                        ...objective,
                        overall_progress: objective.overall_progress || 0,
                        overall_progress_display_mode: objective.overall_progress_display_mode || 'percentage',
                        overall_progress_custom_value: objective.overall_progress_custom_value
                      } as Goal}
                      showLabel={true}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={objective.overall_progress || 0}
                      onChange={(e) => setBuilderState(prev => ({
                        ...prev,
                        objective: { ...prev.objective, overall_progress: parseInt(e.target.value) }
                      }))}
                      className="w-full mt-3"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {objective.overall_progress_display_mode === 'custom'
                        ? 'Slider controls the progress bar position and color (not the display value)'
                        : 'Adjust slider to preview different progress levels'
                      }
                    </p>
                  </div>
                )}

                {/* Visual Badge Editor */}
                {builderState.visibleComponents.visualBadge && (
                  <div className="mb-6 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-medium text-muted-foreground">
                        VISUAL BADGE
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {/* Badge Text */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={objective.indicator_text || ''}
                          onChange={(e) => setBuilderState(prev => ({
                            ...prev,
                            objective: { ...prev.objective, indicator_text: e.target.value }
                          }))}
                          placeholder="e.g., Priority, Featured"
                          maxLength={20}
                          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Badge Color */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                          Badge Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={objective.indicator_color || '#10b981'}
                            onChange={(e) => setBuilderState(prev => ({
                              ...prev,
                              objective: { ...prev.objective, indicator_color: e.target.value }
                            }))}
                            className="h-9 w-16 border border-border rounded cursor-pointer"
                          />
                          <div
                            className="flex-1 h-9 rounded border border-border"
                            style={{ backgroundColor: objective.indicator_color || '#10b981' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview Badge */}
                    {objective.indicator_text && (
                      <div className="p-3 bg-white rounded-md border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: objective.indicator_color || '#10b981',
                            color: '#ffffff'
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                          {objective.indicator_text}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Properties Grid */}
                {(objective.owner_name || objective.department || objective.start_date || objective.priority) && (
                  <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-muted/20 rounded-lg">
                    {objective.owner_name && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Owner</div>
                          <div className="font-medium">{objective.owner_name}</div>
                        </div>
                      </div>
                    )}
                    {objective.department && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Department</div>
                          <div className="font-medium">{objective.department}</div>
                        </div>
                      </div>
                    )}
                    {objective.start_date && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Timeline</div>
                          <div className="font-medium">{objective.start_date} - {objective.end_date}</div>
                        </div>
                      </div>
                    )}
                    {objective.priority && (
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Priority</div>
                          <div className="font-medium capitalize">{objective.priority}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Goals Section */}
                {builderState.goals.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">Goals Component</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{builderState.goals.length} goals</span>
                    </div>
                    <div className="space-y-2">
                      {builderState.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-border rounded-lg hover:border-primary/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">{goal.title}</div>
                              {goal.description && (
                                <div className="text-xs text-muted-foreground">{goal.description}</div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeGoal(idx)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComponentLibrary = () => {
    return (
      <div className="h-full flex flex-col bg-white border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Goals</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Add goals to this objective</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add Goal/Sub-Goal Button - Only show if level allows children */}
          {canHaveChildren ? (
            <button
              onClick={addGoal}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg text-left transition-all group"
            >
              <div className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg">
                <Plus size={20} />
              </div>
              <div>
                <div className="font-semibold text-blue-900 text-sm">
                  Add New {childLabelSingular}
                </div>
                <div className="text-xs text-blue-700 mt-0.5">
                  Click to create a {childLabelSingular.toLowerCase()}
                </div>
              </div>
            </button>
          ) : (
            <div className="w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Sub-goals cannot have further nested children
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Use metrics and visualizations to track progress on this sub-goal
              </p>
            </div>
          )}

          {/* Goals/Sub-Goals List */}
          {builderState.goals.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {childLabel.toUpperCase()} ({builderState.goals.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {builderState.goals.map((goal, idx) => {
                  const metrics = goal.id ? goalMetrics[goal.id] || [] : [];
                  return (
                    <div key={idx} className="border border-border rounded-md bg-white">
                      {/* Goal Header */}
                      <div className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors group">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-foreground">
                                Goal {goal.goal_number}
                              </span>
                              {goal.indicator_text && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: goal.indicator_color || '#10b981' }}
                                >
                                  {goal.indicator_text}
                                </span>
                              )}
                              {metrics.length > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                  {metrics.length} {metrics.length === 1 ? 'metric' : 'metrics'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {goal.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => addSubGoal(idx)}
                            className="flex-shrink-0 p-1 hover:bg-purple-50 rounded"
                            title="Add Sub-Goal"
                          >
                            <Plus className="h-3.5 w-3.5 text-purple-600" />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentGoalForMetric({
                                idx,
                                id: goal.id || `temp-${idx}`,
                                goal_number: goal.goal_number || `${idx + 1}`
                              });
                              setEditingMetric(null);
                              setShowMetricWizard(true);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-green-50 rounded"
                            title="Add Measure"
                          >
                            <BarChart3 className="h-3.5 w-3.5 text-green-600" />
                          </button>
                          <button
                            onClick={() => editGoal(idx)}
                            className="flex-shrink-0 p-1 hover:bg-blue-50 rounded"
                            title="Edit Goal"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => removeGoal(idx)}
                            className="flex-shrink-0 p-1 hover:bg-red-50 rounded"
                            title="Remove Goal"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Metrics List */}
                      {metrics.length > 0 && (
                        <div className="border-t border-border bg-muted/10 px-3 py-2">
                          <div className="space-y-1">
                            {metrics.map((metric) => (
                              <div
                                key={metric.id}
                                className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-50 transition-colors group/metric"
                              >
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <BarChart3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs font-medium truncate">{metric.metric_name || metric.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({metric.visualization_type?.replace('-', ' ')})
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 opacity-0 group-hover/metric:opacity-100 transition-all">
                                  <button
                                    onClick={() => {
                                      setEditingMetric(metric);
                                      setCurrentGoalForMetric({
                                        idx,
                                        id: goal.id || `temp-${idx}`,
                                        goal_number: goal.goal_number || `${idx + 1}`
                                      });
                                      setShowMetricWizard(true);
                                    }}
                                    className="p-1 hover:bg-blue-100 rounded"
                                    title="Edit Metric"
                                  >
                                    <Edit2 className="h-3 w-3 text-blue-600" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Delete metric "${metric.metric_name || metric.name}"?`)) {
                                        try {
                                          await deleteMetricMutation.mutateAsync(metric.id);
                                          // Refresh metrics for this goal
                                          if (goal.id) {
                                            const updatedMetrics = await MetricsService.getByGoal(goal.id);
                                            setGoalMetrics(prev => ({
                                              ...prev,
                                              [goal.id!]: updatedMetrics
                                            }));
                                          }
                                        } catch (error) {
                                          console.error('Error deleting metric:', error);
                                          alert('Failed to delete metric');
                                        }
                                      }
                                    }}
                                    className="p-1 hover:bg-red-100 rounded"
                                    title="Delete Metric"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sub-Goals List */}
                      {goal.children && goal.children.length > 0 && (
                        <div className="border-t border-border bg-purple-50/30 px-3 py-2">
                          <div className="text-xs font-medium text-purple-700 mb-2">SUB-GOALS</div>
                          <div className="space-y-1">
                            {goal.children.map((subGoal, subIdx) => {
                              const subGoalMetrics = subGoal.id ? goalMetrics[subGoal.id] || [] : [];
                              return (
                                <div
                                  key={subIdx}
                                  className="flex items-center justify-between p-2 bg-white rounded hover:bg-purple-50 transition-colors group/subgoal"
                                >
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <ChevronRight className="h-3 w-3 text-purple-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium text-purple-700">
                                          {subGoal.goal_number}
                                        </span>
                                        {subGoalMetrics.length > 0 && (
                                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {subGoalMetrics.length}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {subGoal.title}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover/subgoal:opacity-100 transition-all">
                                    <button
                                      onClick={() => {
                                        setCurrentGoalForMetric({
                                          idx: subIdx,
                                          id: subGoal.id || `temp-${idx}-${subIdx}`,
                                          goal_number: subGoal.goal_number || `${goal.goal_number}.${subIdx + 1}`
                                        });
                                        setEditingMetric(null);
                                        setShowMetricWizard(true);
                                      }}
                                      className="p-1 hover:bg-green-100 rounded"
                                      title="Add Measure"
                                    >
                                      <BarChart3 className="h-3 w-3 text-green-600" />
                                    </button>
                                    <button
                                      onClick={() => editSubGoal(idx, subIdx)}
                                      className="p-1 hover:bg-blue-100 rounded"
                                      title="Edit Sub-Goal"
                                    >
                                      <Edit2 className="h-3 w-3 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => removeSubGoal(idx, subIdx)}
                                      className="p-1 hover:bg-red-100 rounded"
                                      title="Remove Sub-Goal"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActiveComponents = () => {
    const { objective, goals, visibleComponents } = builderState;

    const activeComponents = [
      {
        id: 'title' as const,
        label: 'Title',
        value: objective.title,
        active: !!objective.title,
        visible: visibleComponents.title
      },
      {
        id: 'description' as const,
        label: 'Description',
        value: objective.description,
        active: !!objective.description,
        visible: visibleComponents.description
      },
      {
        id: 'cardImage' as const,
        label: 'Header Visual',
        value: objective.image_url || objective.header_color,
        active: !!(objective.image_url || objective.header_color),
        visible: visibleComponents.cardImage
      },
      {
        id: 'progressBar' as const,
        label: 'Progress Bar',
        value: 'Enabled',
        active: true,
        visible: visibleComponents.progressBar
      },
      {
        id: 'visualBadge' as const,
        label: 'Visual Badge',
        value: objective.indicator_text || 'Not set',
        active: !!objective.indicator_text,
        visible: visibleComponents.visualBadge
      },
    ];

    return (
      <div className="h-full flex flex-col bg-white border-l border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Active Components</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle components on/off
              </p>
            </div>
            <button className="p-1 hover:bg-muted rounded">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Active Components List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1.5">
            {activeComponents.map(component => (
              <div
                key={component.id}
                className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                  component.visible
                    ? 'bg-white border-border'
                    : 'bg-muted/30 border-transparent opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${component.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{component.label}</div>
                    {component.active && component.value && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {typeof component.value === 'string' ? component.value.substring(0, 30) : 'Configured'}
                      </div>
                    )}
                  </div>
                </div>
                <button className="flex-shrink-0 ml-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={component.visible}
                      onChange={() => toggleComponent(component.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </button>
              </div>
            ))}

            {/* Goals Section */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-foreground">Goals</div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {goals.length}
                </span>
              </div>
              {goals.length > 0 ? (
                <div className="space-y-1.5">
                  {goals.map((goal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-border rounded-md">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{goal.title}</span>
                      </div>
                      <button className="flex-shrink-0 ml-2 p-1 hover:bg-muted rounded">
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground">No goals added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border space-y-2 bg-white">
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-md">
            <p className="font-medium mb-1">Ready to save?</p>
            <p>Use the "Save & Publish" button at the top of the page</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading objective...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditMode ? 'Edit Strategic Objective' : 'Create Strategic Objective'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditMode ? 'Update your strategic objective and goals' : 'Build your strategic objective visually'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/${slug}/admin/goals`)}
            className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndPublish}
            disabled={
              isSaving ||
              !builderState.objective.title ||
              !!validationErrors.objectiveTitle ||
              !!validationErrors.objectiveDescription ||
              (validationErrors.goals && Object.keys(validationErrors.goals).length > 0)
            }
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title={
              validationErrors.objectiveTitle || validationErrors.objectiveDescription
                ? 'Please fix validation errors before saving'
                : ''
            }
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save & Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Builder Interface */}
      <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Mobile: Stacked Layout, Desktop: 3 Column Layout */}
        <div className="flex flex-col lg:flex-row" style={{ minHeight: '500px', height: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {/* Left Sidebar - Component Library (Hidden on mobile, shown in tabs) */}
          <div className="hidden lg:block lg:w-80 border-r border-border overflow-y-auto">
            {renderComponentLibrary()}
          </div>

          {/* Center - Visual Canvas */}
          <div className="flex-1 bg-slate-50 overflow-y-auto order-1 lg:order-none">
            {renderCenterCanvas()}
          </div>

          {/* Right Sidebar - Active Components */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto order-2">
            {renderActiveComponents()}
          </div>
        </div>
      </div>

      {/* Property Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-primary">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProperty === 'title' && 'Add Objective Title'}
                {editingProperty === 'description' && 'Add Description'}
                {editingProperty === 'executive_summary' && 'Add Executive Summary'}
                {editingProperty === 'image_url' && 'Add Header Image'}
                {editingProperty === 'header_color' && 'Choose Header Color'}
                {editingProperty === 'owner' && 'Add Owner'}
                {editingProperty === 'department' && 'Add Department'}
                {editingProperty === 'dates' && 'Set Timeline'}
                {editingProperty === 'priority' && 'Set Priority'}
                {editingProperty === 'progress_display' && 'Progress Display Mode'}
              </h3>

              {editingProperty === 'title' || editingProperty === 'owner' || editingProperty === 'department' ? (
                <input
                  type="text"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder={
                    editingProperty === 'title' ? 'Enter objective title...' :
                    editingProperty === 'owner' ? 'Enter owner name...' :
                    'Enter department name...'
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              ) : editingProperty === 'dates' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ) : editingProperty === 'priority' ? (
                <div className="space-y-2">
                  {['critical', 'high', 'medium', 'low'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setPropertyValue(level)}
                      className={`w-full px-4 py-3 text-left border rounded-md transition-all ${
                        propertyValue === level
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{level}</span>
                        {propertyValue === level && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : editingProperty === 'progress_display' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Choose how progress will be displayed on this objective</p>
                  {[
                    { value: 'percentage', label: 'Percentage', description: 'Show as 75%' },
                    { value: 'qualitative', label: 'Qualitative', description: 'Show as Excellent/Great/Good/Below' },
                    { value: 'score', label: 'Score out of 5', description: 'Show as 3.75/5.00' },
                    { value: 'custom', label: 'Custom Value', description: 'Show custom text or number (e.g., "3.71", "Proficient")' },
                    { value: 'color-only', label: 'Color Only', description: 'Just the progress bar color' },
                    { value: 'hidden', label: 'Hidden', description: 'Don\'t show progress' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setPropertyValue(mode.value)}
                      className={`w-full px-4 py-3 text-left border rounded-md transition-all ${
                        propertyValue === mode.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{mode.description}</div>
                        </div>
                        {propertyValue === mode.value && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Custom Value Input - Show when 'custom' mode is selected */}
                  {propertyValue === 'custom' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Custom Display Value *
                        </label>
                        <input
                          type="text"
                          value={showGoalModal ? goalForm.overall_progress_custom_value : builderState.objective.overall_progress_custom_value || ''}
                          onChange={(e) => {
                            if (showGoalModal) {
                              setGoalForm(prev => ({
                                ...prev,
                                overall_progress_custom_value: e.target.value
                              }));
                            } else {
                              setBuilderState(prev => ({
                                ...prev,
                                objective: { ...prev.objective, overall_progress_custom_value: e.target.value }
                              }));
                            }
                          }}
                          placeholder='e.g., "3.71", "Proficient", "On Track"'
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This value will be displayed instead of the percentage. The progress slider still controls the bar color and position.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : editingProperty === 'image_url' ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the URL of an image to use as the header background
                  </p>
                  {propertyValue && (
                    <div className="mt-2 border border-border rounded-md overflow-hidden">
                      <img
                        src={propertyValue}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : editingProperty === 'header_color' ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      className="h-12 w-20 border border-border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div
                    className="h-20 rounded-md border border-border"
                    style={{ backgroundColor: propertyValue }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a color or enter a hex code
                  </p>
                </div>
              ) : (
                <textarea
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(e.target.value)}
                  placeholder={`Enter ${editingProperty === 'description' ? 'description' : 'executive summary'}...`}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  autoFocus
                />
              )}

              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setEditingProperty(null);
                    setPropertyValue('');
                  }}
                  className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProperty}
                  className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Goal Modal - Wizard */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingSubGoalParentIndex !== null
                      ? (editingSubGoalIndex !== null ? 'Edit Sub-Goal' : 'Create New Sub-Goal')
                      : (editingGoalIndex !== null ? 'Edit Goal' : 'Create New Goal')
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingSubGoalParentIndex !== null
                      ? 'Define the basic information for your sub-goal'
                      : 'Define the basic information for your goal'
                    }
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoalIndex(null);
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Title *</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setGoalForm({ ...goalForm, title: newTitle });
                      const error = validateGoalTitle(newTitle);
                      setGoalFormError(error);
                    }}
                    placeholder="Enter goal title..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      goalFormError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:ring-primary'
                    }`}
                    autoFocus
                  />
                  {goalFormError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{goalFormError}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {goalForm.title.length} / 200 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    placeholder="Enter goal description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Visual Customization Section */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                    <Flag className="h-4 w-4" />
                    <span>Visual Badge (Optional)</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Indicator Text */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={goalForm.indicator_text}
                        onChange={(e) => setGoalForm({ ...goalForm, indicator_text: e.target.value })}
                        placeholder="e.g., Priority, Featured"
                        maxLength={20}
                        className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Indicator Color */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">
                        Badge Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={goalForm.indicator_color}
                          onChange={(e) => setGoalForm({ ...goalForm, indicator_color: e.target.value })}
                          className="h-9 w-16 border border-border rounded cursor-pointer"
                        />
                        <div
                          className="flex-1 h-9 rounded border border-border"
                          style={{ backgroundColor: goalForm.indicator_color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Badge */}
                  {goalForm.indicator_text && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-md">
                      <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: goalForm.indicator_color,
                          color: '#ffffff'
                        }}
                      >
                        {goalForm.indicator_text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar Preview */}
                {goalForm.show_progress_bar && (
                  <div className="border-t border-border pt-4">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-medium text-muted-foreground">
                          OVERALL PROGRESS (Preview)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {goalForm.overall_progress_display_mode === 'custom' && goalForm.overall_progress_custom_value
                              ? `Displays: "${goalForm.overall_progress_custom_value}" (Bar: ${Math.round(goalForm.overall_progress_override || 0)}%)`
                              : `${Math.round(goalForm.overall_progress_override || 0)}%`
                            }
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Opening progress display config for goal:', goalForm.title, 'Current mode:', goalForm.overall_progress_display_mode);
                              setEditingProperty('progress_display');
                              setPropertyValue(goalForm.overall_progress_display_mode);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Configure display mode"
                          >
                            <Edit2 className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      <OverallProgressBar
                        goal={{
                          overall_progress: goalForm.overall_progress_override || 0,
                          overall_progress_display_mode: goalForm.overall_progress_display_mode || 'percentage',
                          overall_progress_custom_value: goalForm.overall_progress_custom_value
                        } as Goal}
                        showLabel={true}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={goalForm.overall_progress_override || 0}
                        onChange={(e) => setGoalForm({
                          ...goalForm,
                          overall_progress_override: parseInt(e.target.value)
                        })}
                        className="w-full mt-3"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {goalForm.overall_progress_display_mode === 'custom'
                          ? 'Slider controls the progress bar position and color (not the display value)'
                          : 'Adjust slider to preview different progress levels'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Info about adding metrics */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-900">
                    💡 Measures can be added after creating the goal
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowGoalModal(false);
                    setEditingGoalIndex(null);
                  }}
                  className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={saveGoal}
                  disabled={!goalForm.title.trim() || !!goalFormError}
                  className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={goalFormError ? 'Please fix validation errors' : ''}
                >
                  {editingGoalIndex !== null ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Builder Wizard */}
      {showMetricWizard && currentGoalForMetric && (
        <MetricBuilderWizard
          isOpen={showMetricWizard}
          onClose={() => {
            setShowMetricWizard(false);
            setCurrentGoalForMetric(null);
            setEditingMetric(null);
          }}
          onSave={async (metricData) => {
            try {
              if (editingMetric) {
                // Update existing metric
                await updateMetricMutation.mutateAsync({
                  id: editingMetric.id,
                  updates: metricData
                });

                // Refresh metrics for this goal
                const goal = builderState.goals[currentGoalForMetric.idx];
                if (goal.id) {
                  const updatedMetrics = await MetricsService.getByGoal(goal.id);
                  setGoalMetrics(prev => ({
                    ...prev,
                    [goal.id!]: updatedMetrics
                  }));
                }
              } else {
                // Create new metric (only works for saved goals)
                const goal = builderState.goals[currentGoalForMetric.idx];
                if (goal.id) {
                  const newMetric = {
                    ...metricData,
                    goal_id: goal.id
                  };
                  await MetricsService.create(newMetric);

                  // Refresh metrics for this goal
                  const updatedMetrics = await MetricsService.getByGoal(goal.id);
                  setGoalMetrics(prev => ({
                    ...prev,
                    [goal.id!]: updatedMetrics
                  }));
                } else {
                  // For unsaved goals, just add to state (will be saved later)
                  setBuilderState(prev => ({
                    ...prev,
                    goals: prev.goals.map((g, i) =>
                      i === currentGoalForMetric.idx
                        ? { ...g, metrics: [...(g.metrics || []), metricData] }
                        : g
                    )
                  }));
                }
              }

              setShowMetricWizard(false);
              setCurrentGoalForMetric(null);
              setEditingMetric(null);
            } catch (error) {
              console.error('Error saving metric:', error);
              throw error; // Let the wizard handle the error display
            }
          }}
          goalId={currentGoalForMetric.id}
          goalNumber={currentGoalForMetric.goal_number}
          existingMetric={editingMetric || undefined}
        />
      )}
    </div>
  );
}
