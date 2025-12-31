import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Hash
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals, useCreateGoal } from '../../../hooks/useGoals';
import { GoalEditor, type GoalFormData, type MetricFormData } from '../../../components/admin/GoalEditor';

// Stored goal with all its data
interface StoredGoal {
  id: string;
  data: GoalFormData;
  metrics: MetricFormData[];
}

/**
 * CreateObjective - Editorial-style objective creation page
 * Matches the design pattern of AdminDashboard2
 * Now with enhanced GoalEditor for adding goals with metrics
 */
export function CreateObjective() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: district } = useDistrict(slug!);
  const { data: existingGoals } = useGoals(district?.id || '');
  const createGoal = useCreateGoal();

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
  const [startDate, setStartDate] = useState('2025-10-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!title.trim() || !district?.id) return;

    setIsSubmitting(true);
    try {
      // Create the main objective (level 0)
      const newObjective = await createGoal.mutateAsync({
        district_id: district.id,
        title: title.trim(),
        description: description.trim() || null,
        level: 0,
        parent_id: null,
        is_public: visibility === 'public',
        sort_order: existingGoals?.length || 0,
        indicator_text: customBadgeText,
        indicator_color: badgeColor,
        show_progress_bar: showProgressBar,
        start_date: startDate || null,
        end_date: endDate || null,
      });

      // Create child goals (level 1) with their metrics
      for (let i = 0; i < goals.length; i++) {
        const goal = goals[i];
        const childGoal = await createGoal.mutateAsync({
          district_id: district.id,
          title: goal.data.title,
          description: goal.data.description || null,
          level: 1,
          parent_id: newObjective.id,
          is_public: goal.data.is_public,
          sort_order: i,
          indicator_text: goal.data.indicator_text,
          indicator_color: goal.data.indicator_color,
          show_progress_bar: goal.data.show_progress_bar,
          start_date: goal.data.start_date || null,
          end_date: goal.data.end_date || null,
        });

        // TODO: Create metrics for this goal
        // This would require a useCreateMetric hook
        // For now, metrics are stored but not persisted
        console.log('Goal created with metrics:', childGoal.id, goal.metrics);
      }

      // Navigate to the objectives list
      navigate(`/${slug}/admin2/objectives`);
    } catch (error) {
      console.error('Failed to create objective:', error);
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

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="px-10 py-8 max-w-[1100px]">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#8a8a8a] mb-6">
          <Link to={`/${slug}/admin2/objectives`} className="hover:text-[#4a4a4a] transition-colors">
            All objectives
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#1a1a1a]">Create a new strategic objective</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-['Playfair_Display',_Georgia,_serif] text-[32px] font-medium text-[#1a1a1a] tracking-tight mb-2">
            Create a new strategic objective
          </h1>
          <p className="text-[14px] text-[#6a6a6a]">
            To create strategic objectives with more advanced settings, go to the{' '}
            <Link to={`/${slug}/admin2/settings/objectives`} className="text-[#4a6fa5] hover:underline">
              Strategic objectives settings page
            </Link>.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main Form */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Title Field */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
                What is your strategic objective? (Title)
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
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
              <label className="block text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide mb-2">
                Description
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
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#fafaf8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plus className="h-4 w-4 text-[#8a8a8a]" />
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">Goals</span>
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
                <div className="px-5 pb-5 border-t border-[#e8e6e1]">
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

                    {/* Inline Goal Editor */}
                    {showGoalEditor && (
                      <div className="mt-2">
                        <GoalEditor
                          districtId={district?.id || ''}
                          parentObjectiveTitle={title || 'New Objective'}
                          existingGoals={existingGoals || []}
                          existingGoal={
                            editingGoalIndex !== null
                              ? {
                                  id: goals[editingGoalIndex].id,
                                  district_id: district?.id || '',
                                  parent_id: null,
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
                          onSave={handleSaveGoal}
                          onCancel={() => {
                            setShowGoalEditor(false);
                            setEditingGoalIndex(null);
                          }}
                        />
                      </div>
                    )}

                    {/* Add Goal Button */}
                    {!showGoalEditor && (
                      <button
                        onClick={() => setShowGoalEditor(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-[#e8e6e1] rounded-lg text-[13px] font-medium text-[#8a8a8a] hover:border-[#10b981] hover:text-[#10b981] hover:bg-[#f0fdf4] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Goal
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visual Badge Section */}
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-[#8a8a8a]" />
                  <span className="text-[14px] font-semibold text-[#1a1a1a]">Visual Badge</span>
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
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-[#8a8a8a]" />
                  <div>
                    <span className="text-[14px] font-semibold text-[#1a1a1a]">Progress Bar</span>
                    <p className="text-[11px] text-[#8a8a8a]">Display an overall progress indicator</p>
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
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-1">
                Who can see this strategic objective?
              </label>
              <p className="text-[12px] text-[#6a6a6a] mb-3">
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
            <div className="bg-white border border-[#e8e6e1] rounded-xl p-5">
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-3">
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
                onClick={() => navigate(`/${slug}/admin2/objectives`)}
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
                {isSubmitting ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[280px] flex-shrink-0">
            <div className="bg-[#f0fdf4] border border-[#d1fae5] rounded-xl p-5 sticky top-8">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="h-5 w-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Protip</h3>
              </div>
              <p className="text-[13px] text-[#4a4a4a] leading-relaxed">
                We recommend creating strategic objectives that are qualitative and aspirational. 3-5 district-wide objectives per quarter is a good place to start. Need help? Here are some{' '}
                <a href="#" className="text-[#10b981] hover:underline">examples</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
