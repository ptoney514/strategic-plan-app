import { useState } from 'react';
import { X, Plus, Trash2, Eye, Check } from 'lucide-react';
import type { Metric } from '../../lib/types';
import { MetricChartPreview } from './MetricChartPreview';

interface MetricEditFormProps {
  metric: Metric;
  onSave: (updates: Partial<Metric>) => Promise<void>;
  onCancel: () => void;
}

interface DataPoint {
  label: string;
  value: string; // Use string for input control
}

/**
 * MetricEditForm - Inline edit form for metrics with live chart preview
 *
 * Follows the same pattern as GoalEditForm for consistency.
 * Allows editing metric properties and year-over-year data points.
 * Includes a manual "Preview" button to update the chart visualization.
 */
export function MetricEditForm({ metric, onSave, onCancel }: MetricEditFormProps) {
  // Extract existing data points from visualization_config
  const vizConfig = metric.visualization_config as {
    dataPoints?: { label: string; value: number }[];
  } | undefined;

  const existingDataPoints = vizConfig?.dataPoints || [];

  // Form state
  const [name, setName] = useState(metric.metric_name || metric.name || '');
  const [description, setDescription] = useState(metric.description || '');
  const [currentValue, setCurrentValue] = useState(
    metric.current_value?.toString() || ''
  );
  const [targetValue, setTargetValue] = useState(
    metric.target_value?.toString() || ''
  );
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(
    existingDataPoints.map(dp => ({
      label: dp.label,
      value: dp.value.toString(),
    }))
  );

  // Preview state (separate from form state, updates on "Preview" button click)
  const [previewData, setPreviewData] = useState<{
    metricName: string;
    currentValue: number;
    targetValue?: number;
    dataPoints: { label: string; value: number }[];
  } | null>(null);

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    currentValue?: string;
    targetValue?: string;
    dataPoints?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Add new data point
  const handleAddDataPoint = () => {
    setDataPoints([...dataPoints, { label: '', value: '' }]);
  };

  // Remove data point
  const handleRemoveDataPoint = (index: number) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  // Update data point
  const handleUpdateDataPoint = (
    index: number,
    field: 'label' | 'value',
    value: string
  ) => {
    const updated = [...dataPoints];
    updated[index][field] = value;
    setDataPoints(updated);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Metric name is required';
    } else if (name.length > 200) {
      newErrors.name = 'Metric name must be 200 characters or less';
    }

    if (!currentValue.trim()) {
      newErrors.currentValue = 'Current value is required';
    } else if (isNaN(parseFloat(currentValue))) {
      newErrors.currentValue = 'Must be a valid number';
    }

    if (targetValue && isNaN(parseFloat(targetValue))) {
      newErrors.targetValue = 'Must be a valid number';
    }

    // Validate data points
    const invalidDataPoints = dataPoints.filter(
      dp => (dp.label.trim() && isNaN(parseFloat(dp.value))) ||
           (dp.value.trim() && !dp.label.trim())
    );
    if (invalidDataPoints.length > 0) {
      newErrors.dataPoints = 'All data points must have both label and valid number value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update preview
  const handleUpdatePreview = () => {
    if (!validate()) return;

    const validDataPoints = dataPoints
      .filter(dp => dp.label.trim() && dp.value.trim())
      .map(dp => ({
        label: dp.label.trim(),
        value: parseFloat(dp.value),
      }))
      .filter(dp => !isNaN(dp.value)); // Filter out NaN values

    setPreviewData({
      metricName: name,
      currentValue: parseFloat(currentValue),
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      dataPoints: validDataPoints,
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const validDataPoints = dataPoints
        .filter(dp => dp.label.trim() && dp.value.trim())
        .map(dp => ({
          label: dp.label.trim(),
          value: parseFloat(dp.value),
        }))
        .filter(dp => !isNaN(dp.value));

      await onSave({
        metric_name: name.trim(),
        description: description.trim() || undefined,
        current_value: parseFloat(currentValue),
        target_value: targetValue ? parseFloat(targetValue) : undefined,
        visualization_config: {
          ...metric.visualization_config,
          dataPoints: validDataPoints,
        },
      });
    } catch (error) {
      console.error('Failed to save metric:', error);
      throw error; // Keep form open on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#f5f3ef] border-2 border-[#e8e6e1] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[17px] font-bold text-[#1a1a1a]">
          Edit Metric
        </h2>
        <button
          onClick={onCancel}
          className="p-1 rounded hover:bg-[#e8e6e1] transition-colors"
          type="button"
        >
          <X className="h-5 w-5 text-[#6a6a6a]" />
        </button>
      </div>

      {/* Metric Name Field */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
          Metric Name <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Overall average of responses (1-5 rating)"
          className={`w-full px-4 py-3 text-[14px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
            errors.name
              ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
              : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-[12px] text-[#ef4444]">{errors.name}</p>
        )}
        <div className="text-right text-[12px] text-[#8a8a8a] mt-1">
          {name.length} / 200 characters
        </div>
      </div>

      {/* Description Field */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
          Description <span className="text-[#6a6a6a] font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          placeholder="Brief description of the metric..."
          rows={2}
          className="w-full px-4 py-3 text-[14px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors resize-none"
        />
        <div className="text-right text-[12px] text-[#8a8a8a] mt-1">
          {description.length} / 500 characters
        </div>
      </div>

      {/* Current & Target Values */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Current Value */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
            Current Value <span className="text-[#ef4444]">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="3.83"
            className={`w-full px-4 py-3 text-[14px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
              errors.currentValue
                ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
                : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
            }`}
          />
          {errors.currentValue && (
            <p className="mt-1 text-[12px] text-[#ef4444]">{errors.currentValue}</p>
          )}
        </div>

        {/* Target Value */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
            Target Value <span className="text-[#6a6a6a] font-normal">(optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="3.66"
            className={`w-full px-4 py-3 text-[14px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
              errors.targetValue
                ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
                : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
            }`}
          />
          {errors.targetValue && (
            <p className="mt-1 text-[12px] text-[#ef4444]">{errors.targetValue}</p>
          )}
        </div>
      </div>

      {/* Year-over-Year Data Points */}
      <div className="mb-4 pb-4 border-b border-[#e8e6e1]">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[13px] font-semibold text-[#1a1a1a]">
            Year-over-Year Data Points
          </label>
          <button
            onClick={handleAddDataPoint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#10b981] bg-[#d1fae5] border border-[#10b981] rounded-lg hover:bg-[#a7f3d0] transition-colors"
            type="button"
          >
            <Plus className="h-3 w-3" />
            Add Data Point
          </button>
        </div>

        {dataPoints.length === 0 ? (
          <div className="text-center py-6 bg-white border border-[#e8e6e1] rounded-lg">
            <p className="text-[13px] text-[#8a8a8a]">
              No data points yet. Add year-over-year values to visualize trends.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dataPoints.map((dp, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={dp.label}
                  onChange={(e) => handleUpdateDataPoint(index, 'label', e.target.value)}
                  placeholder="Year (e.g., 2024)"
                  className="flex-1 px-3 py-2 text-[13px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors"
                />
                <input
                  type="number"
                  step="0.01"
                  value={dp.value}
                  onChange={(e) => handleUpdateDataPoint(index, 'value', e.target.value)}
                  placeholder="Value (e.g., 3.75)"
                  className="flex-1 px-3 py-2 text-[13px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors"
                />
                <button
                  onClick={() => handleRemoveDataPoint(index)}
                  className="p-2 text-[#6a6a6a] hover:text-[#ef4444] hover:bg-[#fee2e2] rounded-lg transition-colors"
                  type="button"
                  title="Remove data point"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.dataPoints && (
          <p className="mt-2 text-[12px] text-[#ef4444]">{errors.dataPoints}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3 mb-6">
        <button
          onClick={handleUpdatePreview}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-[#1a1a1a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-gray-50 transition-colors"
          type="button"
        >
          <Eye className="h-4 w-4" />
          Update Preview
        </button>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-[13px] font-semibold text-[#6a6a6a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-gray-50 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            type="button"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div className="border-t border-[#e8e6e1] pt-6">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-4 uppercase tracking-wide">
            Preview
          </h3>
          <MetricChartPreview
            metricName={previewData.metricName}
            currentValue={previewData.currentValue}
            targetValue={previewData.targetValue}
            dataPoints={previewData.dataPoints}
            metricType={metric.metric_type || 'number'}
            chartColor="#2563EB"
            isHigherBetter={metric.is_higher_better !== false}
          />
        </div>
      )}
    </div>
  );
}
