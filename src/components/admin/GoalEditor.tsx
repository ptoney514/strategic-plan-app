import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Save,
  Plus,
  Trash2,
  Edit2,
  BarChart3,
  Hash,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Goal, HierarchicalGoal } from '../../lib/types';
import { MetricEditor } from './MetricEditor';

// Badge preset type
type BadgePreset = 'on-target' | 'needs-attention' | 'off-target' | 'custom';

interface GoalEditorProps {
  /** District ID for the goal */
  districtId: string;
  /** Parent objective ID (level 0 goal) */
  parentObjectiveId?: string;
  /** Parent objective title for breadcrumb */
  parentObjectiveTitle?: string;
  /** Existing goals for parent selection dropdown */
  existingGoals?: HierarchicalGoal[];
  /** Existing goal data if editing */
  existingGoal?: Goal;
  /** Callback when goal is saved */
  onSave: (goalData: GoalFormData, metrics: MetricFormData[]) => Promise<void>;
  /** Callback when cancelled */
  onCancel: () => void;
  /** Whether the form is in a saving state */
  isSaving?: boolean;
}

export interface GoalFormData {
  title: string;
  description: string;
  parent_id: string | null;
  indicator_text: string;
  indicator_color: string;
  start_date: string;
  end_date: string;
  show_progress_bar: boolean;
  is_public: boolean;
}

export interface MetricFormData {
  id?: string;
  name: string;
  description: string;
  metric_type: 'rating' | 'number' | 'percent';
  visualization_type: 'likert' | 'number' | 'progress';
  current_value: number | null;
  target_value: number | null;
  unit: string;
  visualization_config: {
    scaleMin?: number;
    scaleMax?: number;
    showHistorical?: boolean;
    format?: 'whole' | 'decimal1' | 'decimal2';
  };
}

// Color presets for badges
const COLOR_PRESETS = [
  { name: 'green', hex: '#10b981' },
  { name: 'yellow', hex: '#f59e0b' },
  { name: 'red', hex: '#ef4444' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'purple', hex: '#8b5cf6' },
  { name: 'gray', hex: '#6b7280' },
];

// Badge presets
const BADGE_PRESETS: Record<BadgePreset, { text: string; color: string }> = {
  'on-target': { text: 'On Target', color: '#10b981' },
  'needs-attention': { text: 'Needs Attention', color: '#f59e0b' },
  'off-target': { text: 'Off Target', color: '#ef4444' },
  'custom': { text: '', color: '#6b7280' },
};

export function GoalEditor({
  districtId: _districtId,
  parentObjectiveId,
  parentObjectiveTitle,
  existingGoals = [],
  existingGoal,
  onSave,
  onCancel,
  isSaving = false,
}: GoalEditorProps) {
  // Form state
  const [title, setTitle] = useState(existingGoal?.title || '');
  const [description, setDescription] = useState(existingGoal?.description || '');
  const [parentId, setParentId] = useState<string | null>(
    existingGoal?.parent_id || parentObjectiveId || null
  );

  // Badge state
  const [badgePreset, setBadgePreset] = useState<BadgePreset>('on-target');
  const [badgeText, setBadgeText] = useState(
    existingGoal?.indicator_text || BADGE_PRESETS['on-target'].text
  );
  const [badgeColor, setBadgeColor] = useState(
    existingGoal?.indicator_color || BADGE_PRESETS['on-target'].color
  );

  // Timeline state
  const [startDate, setStartDate] = useState(existingGoal?.start_date || '');
  const [endDate, setEndDate] = useState(existingGoal?.end_date || '');

  // Display options state
  const [showProgressBar, setShowProgressBar] = useState(
    existingGoal?.show_progress_bar ?? true
  );
  const [isPublic, setIsPublic] = useState(existingGoal?.is_public ?? true);

  // Metrics state
  const [metrics, setMetrics] = useState<MetricFormData[]>([]);
  const [showMetricEditor, setShowMetricEditor] = useState(false);
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(null);

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    metrics: true,
    timeline: true,
    display: true,
  });

  // Load existing metrics if editing
  useEffect(() => {
    if (existingGoal?.metrics) {
      setMetrics(
        existingGoal.metrics.map((m) => ({
          id: m.id,
          name: m.name || m.metric_name || '',
          description: m.description || '',
          metric_type: m.metric_type as 'rating' | 'number' | 'percent' || 'number',
          visualization_type: (m.visualization_type as 'likert' | 'number' | 'progress') || 'number',
          current_value: m.current_value ?? null,
          target_value: m.target_value ?? null,
          unit: m.unit || '',
          visualization_config: (m.visualization_config as MetricFormData['visualization_config']) || {},
        }))
      );
    }
  }, [existingGoal]);

  // Handle badge preset change
  const handleBadgePresetChange = (preset: BadgePreset) => {
    setBadgePreset(preset);
    if (preset !== 'custom') {
      setBadgeText(BADGE_PRESETS[preset].text);
      setBadgeColor(BADGE_PRESETS[preset].color);
    }
  };

  // Handle adding a new metric
  const handleAddMetric = (metric: MetricFormData) => {
    if (editingMetricIndex !== null) {
      // Update existing metric
      const updated = [...metrics];
      updated[editingMetricIndex] = metric;
      setMetrics(updated);
      setEditingMetricIndex(null);
    } else {
      // Add new metric
      setMetrics([...metrics, metric]);
    }
    setShowMetricEditor(false);
  };

  // Handle removing a metric
  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  // Handle editing a metric
  const handleEditMetric = (index: number) => {
    setEditingMetricIndex(index);
    setShowMetricEditor(true);
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) return;

    const goalData: GoalFormData = {
      title: title.trim(),
      description: description.trim(),
      parent_id: parentId,
      indicator_text: badgeText,
      indicator_color: badgeColor,
      start_date: startDate,
      end_date: endDate,
      show_progress_bar: showProgressBar,
      is_public: isPublic,
    };

    await onSave(goalData, metrics);
  };

  // Build parent options for dropdown
  const getParentOptions = () => {
    const options: { id: string; label: string; level: number }[] = [];

    const addGoalAndChildren = (goal: HierarchicalGoal, depth: number = 0) => {
      // Only allow level 0 and 1 as parents (can't nest deeper than level 2)
      if (goal.level <= 1) {
        options.push({
          id: goal.id,
          label: `${goal.goal_number} ${goal.title}`,
          level: depth,
        });
      }
      goal.children?.forEach((child) => addGoalAndChildren(child, depth + 1));
    };

    existingGoals.forEach((goal) => addGoalAndChildren(goal));
    return options;
  };

  const parentOptions = getParentOptions();

  return (
    <div className="bg-white border border-[#e5e8ed] rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-[#f8f9fb] border-b border-[#e5e8ed] px-6 py-4">
        {/* Breadcrumb */}
        {parentObjectiveTitle && (
          <nav className="flex items-center gap-2 text-[12px] text-[#8b93a5] mb-3">
            <span>Strategic Objectives</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#5c6578]">{parentObjectiveTitle}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1a1f2e]">
              {existingGoal ? 'Edit Goal' : 'Add Goal'}
            </span>
          </nav>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a1f2e]">
              {existingGoal ? 'Edit goal' : 'Create a new goal'}
            </h2>
            {parentObjectiveTitle && (
              <p className="text-[12px] text-[#8b93a5] mt-1">
                Under: {parentObjectiveTitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[13px] font-medium text-[#5c6578] bg-white border border-[#dfe2e8] rounded-md hover:bg-[#f8f9fb] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isSaving}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#10b981] rounded-md hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : existingGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#1a1f2e] mb-1.5">
              Goal Title <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grow and nurture a district culture"
              className="w-full px-3 py-2.5 text-[14px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#1a1f2e] mb-1.5">
              Description <span className="text-[#8b93a5] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this goal aims to achieve..."
              rows={3}
              className="w-full px-3 py-2.5 text-[14px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-all resize-none"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#eef0f4]" />

        {/* Parent Goal */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a1f2e] mb-1.5">
            Parent Goal <span className="text-[#8b93a5] font-normal">(makes this a sub-goal)</span>
          </label>
          <select
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value || null)}
            className="w-full px-3 py-2.5 text-[14px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238b93a5%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center]"
          >
            <option value="">None — this is a top-level goal</option>
            {parentOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {'  '.repeat(opt.level)}{opt.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#8b93a5] mt-1.5">
            Select a parent to nest this as a sub-goal (e.g., 1.1.1)
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#eef0f4]" />

        {/* Visual Badge Section */}
        <div>
          <button
            onClick={() => toggleSection('badge')}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-[#8b93a5] uppercase tracking-wide mb-3"
          >
            Visual Badge
            {expandedSections.badge ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.badge && (
            <div className="space-y-4">
              {/* Badge Presets */}
              <div className="flex flex-wrap gap-2">
                {(['on-target', 'needs-attention', 'off-target', 'custom'] as BadgePreset[]).map(
                  (preset) => (
                    <button
                      key={preset}
                      onClick={() => handleBadgePresetChange(preset)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-full border-2 transition-all ${
                        badgePreset === preset
                          ? preset === 'on-target'
                            ? 'bg-[#d1fae5] text-[#059669] border-[#10b981]'
                            : preset === 'needs-attention'
                            ? 'bg-[#fef3c7] text-[#b45309] border-[#f59e0b]'
                            : preset === 'off-target'
                            ? 'bg-[#fee2e2] text-[#dc2626] border-[#ef4444]'
                            : 'bg-[#f1f3f6] text-[#5c6578] border-[#5c6578]'
                          : 'bg-transparent border-[#eef0f4] text-[#5c6578] hover:bg-[#f8f9fb]'
                      }`}
                    >
                      {badgePreset === preset && <Check className="h-3 w-3" />}
                      {preset === 'on-target' && 'On Target'}
                      {preset === 'needs-attention' && 'Needs Attention'}
                      {preset === 'off-target' && 'Off Target'}
                      {preset === 'custom' && 'Custom...'}
                    </button>
                  )
                )}
              </div>

              {/* Custom Badge Input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => {
                      setBadgeText(e.target.value);
                      setBadgePreset('custom');
                    }}
                    placeholder="Custom badge text"
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div className="flex gap-1 p-1 border border-[#dfe2e8] rounded-md">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setBadgeColor(color.hex);
                        if (badgePreset !== 'custom') setBadgePreset('custom');
                      }}
                      className={`w-7 h-7 rounded ${
                        badgeColor === color.hex
                          ? 'ring-2 ring-offset-1 ring-[#1a1f2e]'
                          : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Badge Preview */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#8b93a5]">Preview:</span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-white"
                  style={{ backgroundColor: badgeColor }}
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  {badgeText || 'Badge Text'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#eef0f4]" />

        {/* Key Results (Metrics) Section */}
        <div>
          <button
            onClick={() => toggleSection('metrics')}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-[#8b93a5] uppercase tracking-wide mb-3"
          >
            Key Results (Metrics)
            {expandedSections.metrics ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.metrics && (
            <div className="space-y-3">
              {/* Info Box */}
              <div className="flex items-start gap-2.5 px-3 py-2.5 bg-[#dbeafe] rounded-md text-[12px] text-[#1e40af]">
                <BarChart3 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Add measurable outcomes for this goal. These will display on the
                  public view with visualizations like Likert scales or KPI numbers.
                </span>
              </div>

              {/* Metric Cards */}
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 bg-[#f8f9fb] border border-[#eef0f4] rounded-lg hover:border-[#dfe2e8] transition-colors group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#d1fae5] rounded-md text-[#10b981]">
                    {metric.visualization_type === 'likert' ? (
                      <BarChart3 className="h-5 w-5" />
                    ) : (
                      <Hash className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#1a1f2e] truncate">
                      {metric.name || 'Untitled Metric'}
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#8b93a5]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#e5e8ed] rounded text-[10px] font-semibold uppercase tracking-wide">
                        {metric.visualization_type === 'likert' ? 'Likert' : 'Number'}
                      </span>
                      {metric.target_value !== null && (
                        <span>Target: {metric.target_value}{metric.unit}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditMetric(index)}
                      className="w-8 h-8 flex items-center justify-center rounded text-[#8b93a5] hover:bg-[#e5e8ed] hover:text-[#5c6578] transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveMetric(index)}
                      className="w-8 h-8 flex items-center justify-center rounded text-[#8b93a5] hover:bg-[#fee2e2] hover:text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Inline Metric Editor */}
              {showMetricEditor && (
                <MetricEditor
                  existingMetric={
                    editingMetricIndex !== null ? metrics[editingMetricIndex] : undefined
                  }
                  onSave={handleAddMetric}
                  onCancel={() => {
                    setShowMetricEditor(false);
                    setEditingMetricIndex(null);
                  }}
                />
              )}

              {/* Add Metric Button */}
              {!showMetricEditor && (
                <button
                  onClick={() => setShowMetricEditor(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-2 border-dashed border-[#dfe2e8] rounded-lg text-[13px] font-medium text-[#8b93a5] hover:border-[#10b981] hover:text-[#10b981] hover:bg-[#f0fdf4] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Key Result
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#eef0f4]" />

        {/* Timeline Section */}
        <div>
          <button
            onClick={() => toggleSection('timeline')}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-[#8b93a5] uppercase tracking-wide mb-3"
          >
            Timeline
            {expandedSections.timeline ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.timeline && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#eef0f4]" />

        {/* Display Options Section */}
        <div>
          <button
            onClick={() => toggleSection('display')}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-[#8b93a5] uppercase tracking-wide mb-3"
          >
            Display Options
            {expandedSections.display ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.display && (
            <div className="space-y-0">
              {/* Show Progress Bar */}
              <div className="flex items-center justify-between py-3 border-b border-[#eef0f4]">
                <div>
                  <h4 className="text-[13px] font-semibold text-[#1a1f2e]">
                    Show Progress Bar
                  </h4>
                  <p className="text-[11px] text-[#8b93a5]">
                    Display an overall progress indicator
                  </p>
                </div>
                <button
                  onClick={() => setShowProgressBar(!showProgressBar)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors ${
                    showProgressBar ? 'bg-[#10b981]' : 'bg-[#e5e8ed]'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                      showProgressBar ? 'left-[20px]' : 'left-[2px]'
                    }`}
                  />
                </button>
              </div>

              {/* Public Visibility */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-[13px] font-semibold text-[#1a1f2e]">
                    Public Visibility
                  </h4>
                  <p className="text-[11px] text-[#8b93a5]">
                    Show this goal on public dashboards
                  </p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors ${
                    isPublic ? 'bg-[#10b981]' : 'bg-[#e5e8ed]'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                      isPublic ? 'left-[20px]' : 'left-[2px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9fb] border-t border-[#e5e8ed]">
        <label className="flex items-center gap-2 text-[13px] text-[#5c6578] cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#dfe2e8] text-[#10b981] focus:ring-[#10b981]"
          />
          Create another after saving
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-[#5c6578] bg-white border border-[#dfe2e8] rounded-md hover:bg-[#f8f9fb] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSaving}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#10b981] rounded-md hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {existingGoal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}
