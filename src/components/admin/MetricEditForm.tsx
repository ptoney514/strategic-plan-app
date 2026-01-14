import { useState, useMemo, useEffect, useRef } from 'react';
import { X, Eye, Check } from 'lucide-react';
import type { Metric, ChartType } from '../../lib/types';
import { MetricChartPreview } from './MetricChartPreview';
import { useMetricChartData } from '../../hooks/useMetrics';
import { DataPointsEditor, type DataPoint } from './DataPointsEditor';
import { ChartTypeSelector } from './ChartTypeSelector';
import { StatusIndicatorEditor } from './StatusIndicatorEditor';
import { NumberFormatSelector } from './NumberFormatSelector';
import { NarrativeEditor } from '../NarrativeEditor';
import type { NarrativeConfig } from '../../lib/metric-visualizations';

interface MetricEditFormProps {
  metric: Metric;
  onSave: (updates: Partial<Metric>) => Promise<void>;
  onCancel: () => void;
}

/**
 * MetricEditForm - Inline edit form for metrics with live chart preview
 *
 * Follows the same pattern as GoalEditForm for consistency.
 * Allows editing metric properties and year-over-year data points.
 * Includes a manual "Preview" button to update the chart visualization.
 */
export function MetricEditForm({ metric, onSave, onCancel }: MetricEditFormProps) {
  // Fetch time series data as fallback source for year-over-year data
  const { data: timeSeriesData } = useMetricChartData(metric.id, 10);

  // Extract existing data points from visualization_config
  const vizConfig = metric.visualization_config as {
    dataPoints?: { label: string; value: number; target?: number }[];
    chartType?: ChartType;
    displayValue?: string;
    content?: string;
    title?: string;
    showTitle?: boolean;
  } | undefined;

  // Use visualization_config.dataPoints first, then fall back to time series data
  const existingDataPoints = useMemo(() => {
    // First priority: visualization_config.dataPoints
    if (vizConfig?.dataPoints && vizConfig.dataPoints.length > 0) {
      return vizConfig.dataPoints;
    }
    // Fallback: time series data from spb_metric_time_series table
    if (timeSeriesData && timeSeriesData.length > 0) {
      return timeSeriesData.map(ts => ({
        label: ts.period,
        value: ts.actual ?? 0,
        target: ts.target,
      }));
    }
    return [];
  }, [vizConfig?.dataPoints, timeSeriesData]);

  // Form state
  const [name, setName] = useState(metric.metric_name || metric.name || '');
  const [description, setDescription] = useState(metric.description || '');
  const [indicatorText, setIndicatorText] = useState(metric.indicator_text || '');
  const [indicatorColor, setIndicatorColor] = useState<'green' | 'amber' | 'red' | 'gray'>(
    (metric.indicator_color as 'green' | 'amber' | 'red' | 'gray') || 'green'
  );
  const [currentValue, setCurrentValue] = useState(
    metric.current_value?.toString() || ''
  );
  const [targetValue, setTargetValue] = useState(
    metric.target_value?.toString() || ''
  );
  const [baselineValue, setBaselineValue] = useState(
    metric.baseline_value?.toString() || ''
  );
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(
    existingDataPoints.map(dp => ({
      label: dp.label,
      value: dp.value.toString(),
      target: dp.target?.toString() || '',
    }))
  );
  const [chartType, setChartType] = useState<ChartType>(
    vizConfig?.chartType || 'bar'
  );

  // State for number formatting
  const [isPercentage, setIsPercentage] = useState(metric.is_percentage ?? false);
  const [decimalPlaces, setDecimalPlaces] = useState(metric.decimal_places ?? 2);

  // State for 'value' visualization type
  const [displayValue, setDisplayValue] = useState(
    vizConfig?.displayValue || ''
  );

  // State for 'narrative' visualization type
  const [narrativeConfig, setNarrativeConfig] = useState<NarrativeConfig>({
    content: vizConfig?.content || '',
    title: vizConfig?.title || '',
    showTitle: vizConfig?.showTitle !== false,
  });

  // Track if we've loaded time series data to avoid overwriting user edits
  const hasLoadedTimeSeriesRef = useRef(false);

  // Sync time series data to form when it loads (only if no existing data points)
  useEffect(() => {
    if (
      !hasLoadedTimeSeriesRef.current &&
      dataPoints.length === 0 &&
      timeSeriesData &&
      timeSeriesData.length > 0
    ) {
      hasLoadedTimeSeriesRef.current = true;
      setDataPoints(
        timeSeriesData.map(ts => ({
          label: ts.period,
          value: ts.actual?.toString() ?? '0',
          target: ts.target?.toString() || '',
        }))
      );
    }
  }, [timeSeriesData, dataPoints.length]);

  // Preview state (separate from form state, updates on "Preview" button click)
  const [previewData, setPreviewData] = useState<{
    metricName: string;
    currentValue: number;
    targetValue?: number;
    dataPoints: { label: string; value: number; target?: number }[];
    indicatorText?: string;
    indicatorColor?: 'green' | 'amber' | 'red' | 'gray';
    chartType?: ChartType;
    displayValue?: string;
    narrativeConfig?: NarrativeConfig;
    isPercentage?: boolean;
    decimalPlaces?: number;
  } | null>(null);

  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    indicatorText?: string;
    indicatorColor?: string;
    currentValue?: string;
    targetValue?: string;
    baselineValue?: string;
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
    field: 'label' | 'value' | 'target',
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

    // Badge text is optional - only validate length if provided
    if (indicatorText.length > 50) {
      newErrors.indicatorText = 'Badge text must be 50 characters or less';
    }

    // For 'value' and 'narrative' types, current value is optional
    if (chartType !== 'value' && chartType !== 'narrative') {
      if (!currentValue.trim()) {
        newErrors.currentValue = 'Current value is required';
      } else if (isNaN(parseFloat(currentValue))) {
        newErrors.currentValue = 'Must be a valid number';
      }

      if (targetValue && isNaN(parseFloat(targetValue))) {
        newErrors.targetValue = 'Must be a valid number';
      }

      if (baselineValue && isNaN(parseFloat(baselineValue))) {
        newErrors.baselineValue = 'Must be a valid number';
      }

      // Validate data points only for chart types
      const invalidDataPoints = dataPoints.filter(
        dp => (dp.label.trim() && isNaN(parseFloat(dp.value))) ||
             (dp.value.trim() && !dp.label.trim()) ||
             (dp.target && dp.target.trim() && isNaN(parseFloat(dp.target)))
      );
      if (invalidDataPoints.length > 0) {
        newErrors.dataPoints = 'All data points must have valid label and number values';
      }
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
        target: dp.target && dp.target.trim() ? parseFloat(dp.target) : undefined,
      }))
      .filter(dp => !isNaN(dp.value)); // Filter out NaN values

    setPreviewData({
      metricName: name,
      currentValue: currentValue ? parseFloat(currentValue) : 0,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      dataPoints: validDataPoints,
      indicatorText,
      indicatorColor,
      chartType,
      displayValue,
      narrativeConfig,
      isPercentage,
      decimalPlaces,
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
          target: dp.target && dp.target.trim() ? parseFloat(dp.target) : undefined,
        }))
        .filter(dp => !isNaN(dp.value) && (!dp.target || !isNaN(dp.target as number)));

      // Build visualization_config based on chart type
      const newVizConfig = {
        ...metric.visualization_config,
        chartType,
        // For chart types, include data points
        ...(chartType !== 'value' && chartType !== 'narrative' && { dataPoints: validDataPoints }),
        // For 'value' type, include displayValue
        ...(chartType === 'value' && { displayValue }),
        // For 'narrative' type, include narrative content
        ...(chartType === 'narrative' && {
          content: narrativeConfig.content,
          title: narrativeConfig.title,
          showTitle: narrativeConfig.showTitle,
        }),
      };

      await onSave({
        metric_name: name.trim(),
        description: description.trim() || undefined,
        indicator_text: indicatorText.trim() || undefined,
        indicator_color: indicatorText.trim() ? indicatorColor : undefined,
        current_value: currentValue ? parseFloat(currentValue) : undefined,
        target_value: targetValue ? parseFloat(targetValue) : undefined,
        baseline_value: baselineValue ? parseFloat(baselineValue) : undefined,
        metric_type: isPercentage ? 'percent' : 'number', // Sync legacy field
        is_percentage: isPercentage,
        decimal_places: decimalPlaces,
        visualization_config: newVizConfig,
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
          className={`w-full px-4 py-3 text-[14px] text-[#1a1a1a] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
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
          className="w-full px-4 py-3 text-[14px] text-[#1a1a1a] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors resize-none"
        />
        <div className="text-right text-[12px] text-[#8a8a8a] mt-1">
          {description.length} / 500 characters
        </div>
      </div>

      {/* Status Indicator Editor */}
      <StatusIndicatorEditor
        text={indicatorText}
        color={indicatorColor}
        onTextChange={setIndicatorText}
        onColorChange={setIndicatorColor}
        textError={errors.indicatorText}
      />

      {/* Chart Type Selector */}
      <ChartTypeSelector value={chartType} onChange={setChartType} />

      {/* Number Format Selector - hidden for narrative type */}
      {chartType !== 'narrative' && (
        <NumberFormatSelector
          isPercentage={isPercentage}
          decimalPlaces={decimalPlaces}
          onIsPercentageChange={setIsPercentage}
          onDecimalPlacesChange={setDecimalPlaces}
        />
      )}

      {/* Conditional fields based on chart type */}
      {chartType === 'value' ? (
        /* Value Type: Single text input for display value */
        <div className="mb-4 p-4 bg-white border border-[#e8e6e1] rounded-lg">
          <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
            Display Value
          </label>
          <input
            type="text"
            value={displayValue}
            onChange={(e) => setDisplayValue(e.target.value)}
            placeholder="e.g., 3.15, 758, GREAT!, A+"
            className="w-full px-4 py-3 text-[14px] text-[#1a1a1a] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors"
          />
          <p className="mt-2 text-[12px] text-[#8a8a8a]">
            Enter any value to display: numbers, text, grades, or status words.
          </p>
        </div>
      ) : chartType === 'narrative' ? (
        /* Narrative Type: Rich text editor */
        <div className="mb-4 p-4 bg-white border border-[#e8e6e1] rounded-lg">
          <NarrativeEditor
            config={narrativeConfig}
            onChange={setNarrativeConfig}
          />
        </div>
      ) : (
        /* Chart Types: Show values and data points */
        <>
          {/* Current, Target & Baseline Values */}
          <div className="grid grid-cols-3 gap-4 mb-4">
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
                className={`w-full px-4 py-3 text-[14px] text-[#1a1a1a] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
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
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2 whitespace-nowrap">
                Target <span className="text-[#6a6a6a] font-normal">(optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="3.66"
                className={`w-full px-4 py-3 text-[14px] text-[#1a1a1a] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.targetValue
                    ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
                    : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
                }`}
              />
              {errors.targetValue && (
                <p className="mt-1 text-[12px] text-[#ef4444]">{errors.targetValue}</p>
              )}
            </div>

            {/* Baseline Value */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
                Baseline <span className="text-[#6a6a6a] font-normal">(optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={baselineValue}
                onChange={(e) => setBaselineValue(e.target.value)}
                placeholder="3.50"
                className={`w-full px-4 py-3 text-[14px] text-[#1a1a1a] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
                  errors.baselineValue
                    ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
                    : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
                }`}
              />
              {errors.baselineValue && (
                <p className="mt-1 text-[12px] text-[#ef4444]">{errors.baselineValue}</p>
              )}
              <p className="mt-1 text-[11px] text-[#8a8a8a]">
                Starting point for progress calculation
              </p>
            </div>
          </div>

          {/* Year-over-Year Data Points */}
          <DataPointsEditor
            dataPoints={dataPoints}
            onAdd={handleAddDataPoint}
            onRemove={handleRemoveDataPoint}
            onUpdate={handleUpdateDataPoint}
            error={errors.dataPoints}
          />
        </>
      )}

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
            metricType={
              metric.metric_type && ['rating', 'percent', 'currency', 'number'].includes(metric.metric_type)
                ? (metric.metric_type as 'rating' | 'percent' | 'currency' | 'number')
                : 'number'
            }
            chartColor="#2563EB"
            isHigherBetter={metric.is_higher_better !== false}
            indicatorText={previewData.indicatorText}
            indicatorColor={previewData.indicatorColor}
            chartType={previewData.chartType}
            displayValue={previewData.displayValue}
            narrativeConfig={previewData.narrativeConfig}
            isPercentage={previewData.isPercentage}
            decimalPlaces={previewData.decimalPlaces}
          />
        </div>
      )}
    </div>
  );
}
