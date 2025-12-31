import { useState } from 'react';
import {
  X,
  BarChart3,
  Hash,
  Check,
} from 'lucide-react';
import type { MetricFormData } from './GoalEditor';

type MetricVisualizationType = 'likert' | 'number';

interface MetricEditorProps {
  /** Existing metric data if editing */
  existingMetric?: MetricFormData;
  /** Callback when metric is saved */
  onSave: (metric: MetricFormData) => void;
  /** Callback when cancelled */
  onCancel: () => void;
}

// Metric type options
const METRIC_TYPES: {
  id: MetricVisualizationType;
  name: string;
  description: string;
  icon: typeof BarChart3;
  available: boolean;
}[] = [
  {
    id: 'likert',
    name: 'Likert',
    description: '1-5 scale',
    icon: BarChart3,
    available: true,
  },
  {
    id: 'number',
    name: 'Number',
    description: 'KPI value',
    icon: Hash,
    available: true,
  },
];

// Likert scale options
const LIKERT_SCALES = [
  { value: 5, label: '1-5 (5 high)' },
  { value: 7, label: '1-7 (7 high)' },
  { value: 10, label: '1-10 (10 high)' },
];

// Number format options
const NUMBER_FORMATS = [
  { value: 'whole', label: 'Whole number' },
  { value: 'decimal1', label: '1 decimal' },
  { value: 'decimal2', label: '2 decimals' },
];

// Number unit options
const NUMBER_UNITS = [
  { value: '', label: 'None' },
  { value: '%', label: '%' },
  { value: '$', label: '$' },
  { value: 'count', label: 'Count' },
];

export function MetricEditor({
  existingMetric,
  onSave,
  onCancel,
}: MetricEditorProps) {
  // Basic info state
  const [name, setName] = useState(existingMetric?.name || '');
  const [description, setDescription] = useState(existingMetric?.description || '');

  // Type selection state
  const [visualizationType, setVisualizationType] = useState<MetricVisualizationType>(
    (existingMetric?.visualization_type as MetricVisualizationType) || 'likert'
  );

  // Likert-specific state
  const [likertScale, setLikertScale] = useState(
    existingMetric?.visualization_config?.scaleMax || 5
  );
  const [likertTarget, setLikertTarget] = useState<string>(
    existingMetric?.target_value?.toString() || '3.7'
  );
  const [showHistorical, setShowHistorical] = useState(
    existingMetric?.visualization_config?.showHistorical ?? true
  );

  // Number-specific state
  const [numberUnit, setNumberUnit] = useState(existingMetric?.unit || '%');
  const [numberFormat, setNumberFormat] = useState<'whole' | 'decimal1' | 'decimal2'>(
    existingMetric?.visualization_config?.format || 'whole'
  );
  const [currentValue, setCurrentValue] = useState<string>(
    existingMetric?.current_value?.toString() || ''
  );
  const [targetValue, setTargetValue] = useState<string>(
    existingMetric?.target_value?.toString() || ''
  );

  // Handle save
  const handleSave = () => {
    if (!name.trim()) return;

    const metric: MetricFormData = {
      id: existingMetric?.id,
      name: name.trim(),
      description: description.trim(),
      metric_type: visualizationType === 'likert' ? 'rating' : 'number',
      visualization_type: visualizationType,
      current_value: currentValue ? parseFloat(currentValue) : null,
      target_value:
        visualizationType === 'likert'
          ? parseFloat(likertTarget) || null
          : targetValue
          ? parseFloat(targetValue)
          : null,
      unit: visualizationType === 'number' ? numberUnit : '',
      visualization_config: {
        scaleMin: 1,
        scaleMax: visualizationType === 'likert' ? likertScale : undefined,
        showHistorical: visualizationType === 'likert' ? showHistorical : undefined,
        format: visualizationType === 'number' ? numberFormat : undefined,
      },
    };

    onSave(metric);
  };

  // Format preview value
  const getPreviewValue = () => {
    if (visualizationType === 'likert') {
      return currentValue || '3.74';
    }
    if (visualizationType === 'number') {
      const val = currentValue || '94';
      if (numberUnit === '$') return `$${val}`;
      if (numberUnit === '%') return `${val}%`;
      return val;
    }
    return '—';
  };

  // Format preview target
  const getPreviewTarget = () => {
    if (visualizationType === 'likert') {
      return `Target: ${likertTarget || '3.7'} / ${likertScale}.0`;
    }
    if (visualizationType === 'number') {
      const target = targetValue || '96';
      if (numberUnit === '$') return `Target: $${target}`;
      if (numberUnit === '%') return `Target: ${target}%`;
      return `Target: ${target}`;
    }
    return '';
  };

  return (
    <div className="bg-[#f8f9fb] border border-[#e5e8ed] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e8ed] bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-[#10b981] rounded text-white">
            {visualizationType === 'likert' ? (
              <BarChart3 className="h-4 w-4" />
            ) : (
              <Hash className="h-4 w-4" />
            )}
          </div>
          <span className="text-[13px] font-semibold text-[#1a1f2e]">
            {existingMetric ? 'Edit Key Result' : 'Add Key Result'}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 flex items-center justify-center rounded text-[#8b93a5] hover:bg-[#f1f3f6] hover:text-[#1a1f2e] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="block text-[13px] font-semibold text-[#1a1f2e] mb-1.5">
              What are you measuring? <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Student - overall belonging score"
              className="w-full px-3 py-2.5 text-[14px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-all"
            />
            <p className="text-[11px] text-[#8b93a5] mt-1">
              This appears as the metric title on dashboards
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#1a1f2e] mb-1.5">
              Description <span className="text-[#8b93a5] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context about how this metric is measured..."
              rows={2}
              className="w-full px-3 py-2.5 text-[14px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-all resize-none"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e5e8ed]" />

        {/* Visualization Type Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-[#8b93a5] uppercase tracking-wide mb-3">
            Visualization Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {METRIC_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = visualizationType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => type.available && setVisualizationType(type.id)}
                  disabled={!type.available}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                    !type.available
                      ? 'opacity-50 cursor-not-allowed border-[#eef0f4] bg-[#f8f9fb]'
                      : isSelected
                      ? 'border-[#10b981] bg-[#f0fdf4]'
                      : 'border-[#eef0f4] bg-white hover:border-[#dfe2e8] hover:bg-[#f8f9fb]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-md ${
                      isSelected
                        ? 'bg-[#10b981] text-white'
                        : 'bg-[#e5e8ed] text-[#5c6578]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-[12px] font-semibold text-[#1a1f2e]">
                      {type.name}
                    </div>
                    <div className="text-[10px] text-[#8b93a5]">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e5e8ed]" />

        {/* Type-specific Configuration */}
        <div className="bg-white border border-[#e5e8ed] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#eef0f4]">
            <div className="w-7 h-7 flex items-center justify-center bg-[#10b981] rounded text-white">
              {visualizationType === 'likert' ? (
                <BarChart3 className="h-4 w-4" />
              ) : (
                <Hash className="h-4 w-4" />
              )}
            </div>
            <span className="text-[13px] font-semibold text-[#1a1f2e]">
              {visualizationType === 'likert'
                ? 'Likert Scale Configuration'
                : 'Number/KPI Configuration'}
            </span>
          </div>

          {/* Likert Configuration */}
          {visualizationType === 'likert' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                    Scale Range
                  </label>
                  <select
                    value={likertScale}
                    onChange={(e) => setLikertScale(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  >
                    {LIKERT_SCALES.map((scale) => (
                      <option key={scale.value} value={scale.value}>
                        {scale.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                    Target Score
                  </label>
                  <input
                    type="text"
                    value={likertTarget}
                    onChange={(e) => setLikertTarget(e.target.value)}
                    placeholder="3.7"
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                  Current Value <span className="text-[#8b93a5] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="3.74"
                  className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-[13px] font-medium text-[#1a1f2e]">
                    Show historical bar chart
                  </h4>
                  <p className="text-[11px] text-[#8b93a5]">
                    Display year-over-year comparison
                  </p>
                </div>
                <button
                  onClick={() => setShowHistorical(!showHistorical)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors ${
                    showHistorical ? 'bg-[#10b981]' : 'bg-[#e5e8ed]'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
                      showHistorical ? 'left-[20px]' : 'left-[2px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Number Configuration */}
          {visualizationType === 'number' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                    Unit
                  </label>
                  <select
                    value={numberUnit}
                    onChange={(e) => setNumberUnit(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  >
                    {NUMBER_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                    Format
                  </label>
                  <select
                    value={numberFormat}
                    onChange={(e) =>
                      setNumberFormat(e.target.value as 'whole' | 'decimal1' | 'decimal2')
                    }
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  >
                    {NUMBER_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                    Current Value
                  </label>
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="94"
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1a1f2e] mb-1.5">
                    Target Value
                  </label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="96"
                    className="w-full px-3 py-2 text-[13px] border border-[#dfe2e8] rounded-md bg-white focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white border border-[#e5e8ed] rounded-lg p-5 text-center">
          <div className="text-[11px] font-semibold text-[#8b93a5] uppercase tracking-wide mb-2">
            Preview
          </div>
          <div className="text-[42px] font-bold text-[#1a1f2e] leading-none">
            {getPreviewValue()}
          </div>
          <div className="text-[13px] text-[#8b93a5] mt-2">{getPreviewTarget()}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 bg-white border-t border-[#e5e8ed]">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-[13px] font-medium text-[#5c6578] bg-white border border-[#dfe2e8] rounded-md hover:bg-[#f8f9fb] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#10b981] rounded-md hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          {existingMetric ? 'Update Key Result' : 'Add Key Result'}
        </button>
      </div>
    </div>
  );
}
