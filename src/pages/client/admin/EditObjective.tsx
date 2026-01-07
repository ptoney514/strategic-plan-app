import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { useGoal, useGoals, useUpdateGoal, useChildGoals } from '../../../hooks/useGoals';
import { GoalEditor, type GoalFormData, type MetricFormData } from '../../../components/admin/GoalEditor';
import { SlideoverPanel } from '../../../components/ui/SlideoverPanel';
import { Target } from 'lucide-react';

// Stored goal with all its data
interface StoredGoal {
  id: string;
  data: GoalFormData;
  metrics: MetricFormData[];
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
  const { data: district } = useDistrict(slug || '');
  const { data: existingGoals } = useGoals(district?.id || '');
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
  const [quarter, setQuarter] = useState('Q4 2025');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load existing child goals
  useEffect(() => {
    if (childGoals && childGoals.length > 0) {
      const storedGoals: StoredGoal[] = childGoals.map((child) => ({
        id: child.id,
        isExisting: true,
        data: {
          title: child.title,
          description: child.description || '',
          parent_id: child.parent_id,
          indicator_text: child.indicator_text || 'On Target',
          indicator_color: child.indicator_color || '#22c55e',
          start_date: child.start_date || '',
          end_date: child.end_date || '',
          show_progress_bar: child.show_progress_bar ?? true,
          is_public: child.is_public ?? true,
        },
        metrics: (child.metrics || []).map((m) => ({
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
      }));
      setGoals(storedGoals);
    }
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
    if (editingGoalIndex !== null) {
      // Update existing goal
      const updated = [...goals];
      updated[editingGoalIndex] = {
        ...updated[editingGoalIndex],
        data: goalData,
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
          data: goalData,
          metrics,
        },
      ]);
    }
    setShowGoalEditor(false);
  };

  // Handle editing a goal
  const handleEditGoal = (index: number) => {
    setEditingGoalIndex(index);
    setShowGoalEditor(true);
  };

  // Handle removing a goal
  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !objectiveId) return;

    setIsSubmitting(true);
    try {
      // Update the main objective (level 0)
      await updateGoal.mutateAsync({
        id: objectiveId,
        updates: {
          title: title.trim(),
          description: description.trim() || undefined,
          is_public: visibility === 'public',
          indicator_text: customBadgeText,
          indicator_color: badgeColor,
          show_progress_bar: showProgressBar,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      });

      // TODO: Handle child goal updates
      // For now, child goals would need to be updated individually
      // This could be enhanced to handle creates/updates/deletes of children

      // Navigate back to the objective detail view
      navigate(`/admin/objectives/${objectiveId}`);
    } catch (error) {
      console.error('Failed to update objective:', error);
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
              to="/admin/objectives"
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
          <Link to="/admin/objectives" className="hover:text-[#4a4a4a] transition-colors">
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
                onChange={(e) => setTitle(e.target.value)}
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
                    {goals.length} goals
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
                  <div className="flex flex-col gap-3 mt-4">
                    {/* Existing Goals List */}
                    {goals.map((goal, index) => (
                      <div
                        key={goal.id}
                        className="flex items-center gap-3 px-4 py-3 bg-[#f8f9fb] border border-[#e5e8ed] rounded-lg group hover:border-[#dfe2e8] transition-colors"
                      >
                        <GripVertical className="h-4 w-4 text-[#d4d1cb] cursor-grab flex-shrink-0" />

                        {/* Goal Icon */}
                        <div className="w-10 h-10 flex items-center justify-center bg-[#d1fae5] rounded-md text-[#10b981] flex-shrink-0">
                          {goal.metrics.length > 0 ? (
                            goal.metrics[0].visualization_type === 'likert' ? (
                              <BarChart3 className="h-5 w-5" />
                            ) : (
                              <Hash className="h-5 w-5" />
                            )
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-[#10b981]" />
                          )}
                        </div>

                        {/* Goal Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-semibold text-[#1a1a1a] truncate">
                            {goal.data.title}
                          </div>
                          <div className="flex items-center gap-3 text-[12px] text-[#8a8a8a]">
                            {goal.metrics.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e5e8ed] rounded text-[10px] font-semibold uppercase tracking-wide">
                                {goal.metrics.length} metric{goal.metrics.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {goal.data.indicator_text && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                                style={{ backgroundColor: goal.data.indicator_color }}
                              >
                                {goal.data.indicator_text}
                              </span>
                            )}
                            {goal.isExisting && (
                              <span className="text-[10px] text-[#8a8a8a]">
                                (existing)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditGoal(index)}
                            className="w-8 h-8 flex items-center justify-center rounded text-[#8a8a8a] hover:bg-[#e5e8ed] hover:text-[#5c6578] transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveGoal(index)}
                            className="w-8 h-8 flex items-center justify-center rounded text-[#8a8a8a] hover:bg-[#fee2e2] hover:text-[#ef4444] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Goal Button */}
                    <button
                      onClick={() => {
                        setEditingGoalIndex(null);
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
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="px-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg bg-white text-[#4a4a4a] focus:outline-none focus:border-[#10b981]"
                >
                  <option>Q1 2025</option>
                  <option>Q2 2025</option>
                  <option>Q3 2025</option>
                  <option>Q4 2025</option>
                  <option>Q1 2026</option>
                </select>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-[13px] border border-[#e8e6e1] rounded-lg focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => navigate(`/${slug}/admin/objectives`)}
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
                You can update the title, description, and display settings for this objective.
                Changes to child goals will be saved separately. Need to add more goals?
                Use the "Add Goal" button in the Goals section.
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
        <GoalEditor
          districtId={district?.id || ''}
          parentObjectiveTitle={title || 'Objective'}
          existingGoals={existingGoals || []}
          existingGoal={
            editingGoalIndex !== null
              ? {
                  id: goals[editingGoalIndex].id,
                  district_id: district?.id || '',
                  parent_id: objectiveId || null,
                  goal_number: '',
                  title: goals[editingGoalIndex].data.title,
                  description: goals[editingGoalIndex].data.description,
                  level: 1,
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
          }}
          onCancel={() => {
            setShowGoalEditor(false);
            setEditingGoalIndex(null);
          }}
        />
      </SlideoverPanel>
    </div>
  );
}
