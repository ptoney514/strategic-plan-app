import { useEffect, useRef } from 'react';
import { Edit2 } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { StatusBadge, calculateStatus } from './StatusBadge';
import { useMetricChartData } from '../../hooks/useMetrics';
import { MetricEditForm } from '../admin/MetricEditForm';
import { NarrativeDisplay } from '../NarrativeDisplay';
import { formatMetricValue } from '../../lib/utils/formatMetricValue';

interface GoalCardWithMetricsProps {
  goal: Goal;
  metrics: Metric[];
  children?: React.ReactNode; // For nested sub-goals
  colorClass?: string;
  hideHeader?: boolean; // Hide goal header when embedded
  editingMetricId?: string | null; // ID of metric being edited (for admin)
  onEditMetric?: (metricId: string) => void; // Callback to start editing a metric
  onSaveMetric?: (metricId: string, updates: Partial<Metric>) => Promise<void>; // Callback to save metric changes
  onCancelEditMetric?: () => void; // Callback to cancel editing
}

// Chart colors
const chartColors = ['#B91C1C', '#2563EB', '#059669', '#D97706'];

// Compact metric display component
function CompactMetricCard({
  metric,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  metric: Metric;
  index: number;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: (updates: Partial<Metric>) => Promise<void>;
  onCancel?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartColor = chartColors[index % chartColors.length];

  // Fetch time series data
  const { data: chartData } = useMetricChartData(metric.id, 5);

  // Extract data from visualization_config
  const vizConfig = metric.visualization_config as {
    dataPoints?: { label: string; value: number }[];
    targetValue?: number;
    chartType?: 'bar' | 'line' | 'area' | 'donut' | 'value' | 'narrative';
    displayValue?: string;
    content?: string;
    title?: string;
    showTitle?: boolean;
  } | undefined;

  const vizDataPoints = vizConfig?.dataPoints || [];
  const vizTargetValue = vizConfig?.targetValue;
  const chartType = vizConfig?.chartType || 'bar';

  // Get current value with fallbacks
  const getCurrentValue = (): number => {
    if (metric.current_value != null) return metric.current_value;
    if (metric.actual_value != null) return metric.actual_value;
    if (metric.ytd_value != null) return metric.ytd_value;

    if (vizDataPoints.length > 0) {
      const nonZeroValues = vizDataPoints.filter(dp => dp.value > 0);
      if (nonZeroValues.length > 0) {
        const sum = nonZeroValues.reduce((acc, dp) => acc + dp.value, 0);
        return sum / nonZeroValues.length;
      }
    }

    if (chartData && chartData.length > 0) {
      for (let i = chartData.length - 1; i >= 0; i--) {
        if (chartData[i].actual != null) return chartData[i].actual!;
      }
    }

    if (metric.data_points && metric.data_points.length > 0) {
      const lastPoint = metric.data_points[metric.data_points.length - 1];
      if ('value' in lastPoint && lastPoint.value != null) return lastPoint.value;
    }

    return 0;
  };

  const getTargetValue = (): number | null => {
    if (metric.target_value != null) return metric.target_value;
    if (vizTargetValue != null) return vizTargetValue;
    return null;
  };

  const targetValue = getTargetValue();

  const formatValue = (val?: number) => {
    const value = val ?? getCurrentValue();
    const formatted = formatMetricValue({
      value,
      isPercentage: metric.is_percentage,
      decimalPlaces: metric.decimal_places ?? 2,
      metricType: metric.metric_type,
      unit: metric.unit,
      targetValue: metric.target_value,
    });
    return { value: formatted.value, unit: formatted.unit };
  };

  const getTargetComparison = () => {
    if (!targetValue) return null;
    const current = getCurrentValue();
    const diff = current - targetValue;
    if (Math.abs(diff) < 0.01) return 'At target';
    if (metric.is_higher_better !== false) {
      return diff > 0 ? `+${Math.abs(diff).toFixed(2)} above` : `${Math.abs(diff).toFixed(2)} below`;
    }
    return diff < 0 ? `${Math.abs(diff).toFixed(2)} better` : `${Math.abs(diff).toFixed(2)} above`;
  };

  const getStatus = () => {
    if (!targetValue) return calculateStatus(null);
    const current = getCurrentValue();
    const baseline = metric.baseline_value ?? 0;
    const range = targetValue - baseline;
    if (range === 0) return calculateStatus(100);
    const progress = ((current - baseline) / range) * 100;
    return calculateStatus(progress);
  };

  const { value, unit } = formatValue();
  const status = getStatus();
  const targetComparison = getTargetComparison();

  // Draw chart - medium height (200px)
  useEffect(() => {
    // Skip canvas operations for value/narrative types
    if (chartType === 'value' || chartType === 'narrative') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let data: { label: string; value: number; isTarget?: boolean }[] = [];

    if (vizDataPoints.length > 0) {
      data = vizDataPoints
        .filter(dp => dp.value > 0)
        .map(dp => ({ label: dp.label, value: dp.value, isTarget: false }));
      if (targetValue != null) {
        data.push({ label: 'Target', value: targetValue, isTarget: true });
      }
    } else if (chartData && chartData.length > 0) {
      data = chartData
        .filter(d => d.actual != null)
        .map(d => ({ label: d.period, value: d.actual || 0, isTarget: false }));
      if (targetValue != null) {
        data.push({ label: 'Target', value: targetValue, isTarget: true });
      }
    } else if (metric.data_points && metric.data_points.length > 0) {
      data = metric.data_points.map(dp => ({
        label: ('date' in dp && dp.date) || ('label' in dp && dp.label) || '',
        value: dp.value || 0,
        isTarget: false,
      }));
      if (targetValue != null) {
        data.push({ label: 'Target', value: targetValue, isTarget: true });
      }
    } else {
      const current = getCurrentValue();
      const baseline = metric.baseline_value ?? current * 0.8;
      const target = targetValue ?? current * 1.2;
      data = [
        { label: 'Baseline', value: baseline, isTarget: false },
        { label: 'Current', value: current, isTarget: false },
        { label: 'Target', value: target, isTarget: true },
      ];
    }

    if (data.length === 0 || data.every(d => d.value === 0)) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data', rect.width / 2, rect.height / 2);
      return;
    }

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Handle donut chart separately
    if (chartType === 'donut') {
      const donutColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) - 20;
      const innerRadius = radius * 0.6;

      const total = data.filter(d => !d.isTarget).reduce((sum, d) => sum + d.value, 0);

      let startAngle = -Math.PI / 2;
      data.filter(d => !d.isTarget).forEach((d, i) => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = donutColors[i % donutColors.length];
        ctx.fill();

        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius + 12;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.fillStyle = '#374151';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? 'right' : 'left';
        const donutLabelFormatted = formatValue(d.value);
        ctx.fillText(`${d.label}: ${donutLabelFormatted.value}${donutLabelFormatted.unit}`, labelX, labelY);

        startAngle = endAngle;
      });

      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      const centerFormatted = formatValue(total);
      ctx.fillText(centerFormatted.value + centerFormatted.unit, centerX, centerY + 5);
      return;
    }

    const padding = { top: 16, right: 16, bottom: 24, left: 32 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(0, Math.min(...data.map(d => d.value)) * 0.9);
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length;

    // Grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    const gridLines = 3;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Target line
    if (targetValue != null && maxValue > 0) {
      const targetY = padding.top + chartHeight - ((targetValue - minValue) / (maxValue - minValue)) * chartHeight;
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, targetY);
      ctx.lineTo(rect.width - padding.right, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Calculate points for line/area charts
    const points = data.filter(d => !d.isTarget).map((d, i) => {
      const valueRange = maxValue - minValue;
      const x = padding.left + barGap * i + barGap / 2;
      const y = valueRange > 0
        ? padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
        : padding.top + chartHeight;
      return { x, y, value: d.value, label: d.label };
    });

    if (chartType === 'line' || chartType === 'area') {
      // Draw area fill
      if (chartType === 'area' && points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = chartColor + '30';
        ctx.fill();
      }

      // Draw line
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = chartColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw points and labels
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = chartColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const pointFormatted = formatValue(p.value);
        ctx.fillText(pointFormatted.value + pointFormatted.unit, p.x, p.y - 8);

        ctx.fillStyle = '#6B7280';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(p.label, p.x, rect.height - 6);
      });
    } else {
      // Default: Bar chart
      data.forEach((d, i) => {
        if (d.isTarget) return;
        const valueRange = maxValue - minValue;
        const barHeight = valueRange > 0 ? ((d.value - minValue) / valueRange) * chartHeight : 0;
        const x = padding.left + barGap * i + (barGap - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillStyle = chartColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const barFormatted = formatValue(d.value);
        ctx.fillText(barFormatted.value + barFormatted.unit, x + barWidth / 2, y - 4);

        ctx.fillStyle = '#6B7280';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(d.label, x + barWidth / 2, rect.height - 6);
      });
    }

    // Y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const gridValue = maxValue - ((maxValue - minValue) / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i + 3;
      const yAxisFormatted = formatValue(gridValue);
      ctx.fillText(yAxisFormatted.value, padding.left - 6, y);
    }
  }, [metric, chartColor, chartData, vizDataPoints, targetValue, chartType, getCurrentValue]);

  // Check if metric has data - must be after all hooks
  const hasData = (): boolean => {
    if (metric.current_value != null && metric.current_value !== 0) return true;
    if (metric.actual_value != null && metric.actual_value !== 0) return true;
    if (metric.ytd_value != null && metric.ytd_value !== 0) return true;
    if (vizDataPoints.length > 0 && vizDataPoints.some(dp => dp.value > 0)) return true;
    if (chartData && chartData.length > 0 && chartData.some(d => d.actual != null && d.actual !== 0)) return true;
    if (metric.data_points && metric.data_points.length > 0) {
      const hasValue = metric.data_points.some(dp => 'value' in dp && dp.value != null && dp.value !== 0);
      if (hasValue) return true;
    }
    return false;
  };

  if (!hasData()) return null;

  // Show edit form if in edit mode
  if (isEditing && onSave && onCancel) {
    return <MetricEditForm metric={metric} onSave={onSave} onCancel={onCancel} />;
  }

  // Handle 'value' visualization type
  if (chartType === 'value') {
    const displayVal = vizConfig?.displayValue || metric.current_value?.toString() || '—';
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Value
          </span>
          <div className="flex items-center gap-2">
            {metric.indicator_text && metric.indicator_color && (
              <StatusBadge
                customText={metric.indicator_text}
                customColor={metric.indicator_color as 'green' | 'amber' | 'red' | 'gray'}
                size="sm"
              />
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                title="Edit metric"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-gray-900 font-medium text-sm mb-4 line-clamp-2">
          {metric.metric_name || metric.name}
        </h4>

        {/* Display Value */}
        <div className="flex items-center justify-center py-6">
          <span className="text-4xl font-bold text-gray-900 tracking-tight">
            {displayVal}
          </span>
        </div>
      </div>
    );
  }

  // Handle 'narrative' visualization type
  if (chartType === 'narrative') {
    const narrativeConfig = {
      content: vizConfig?.content || '',
      title: vizConfig?.title,
      showTitle: vizConfig?.showTitle !== false,
    };
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Narrative
          </span>
          <div className="flex items-center gap-2">
            {metric.indicator_text && metric.indicator_color && (
              <StatusBadge
                customText={metric.indicator_text}
                customColor={metric.indicator_color as 'green' | 'amber' | 'red' | 'gray'}
                size="sm"
              />
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                title="Edit metric"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-gray-900 font-medium text-sm mb-4 line-clamp-2">
          {metric.metric_name || metric.name}
        </h4>

        {/* Narrative Content */}
        {narrativeConfig.content ? (
          <NarrativeDisplay config={narrativeConfig} />
        ) : (
          <div className="text-center text-gray-400 py-6">
            No content available
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
          {metric.metric_type === 'rating' ? 'Rating' : metric.metric_category || 'Metric'}
        </span>
        <div className="flex items-center gap-2">
          {metric.indicator_text && metric.indicator_color ? (
            <StatusBadge
              customText={metric.indicator_text}
              customColor={metric.indicator_color as 'green' | 'amber' | 'red' | 'gray'}
              size="sm"
            />
          ) : (
            <StatusBadge status={status} size="sm" />
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
              title="Edit metric"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">
        {metric.metric_name || metric.name}
      </h4>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-semibold text-gray-900 tracking-tight font-display">
          {value}
        </span>
        {unit && (
          <span className="text-base text-gray-400 font-medium font-display">
            {unit}
          </span>
        )}
      </div>

      {/* Target */}
      {targetValue && (
        <div className="text-xs text-gray-500 mb-3">
          Target: <span className="text-gray-700">{formatValue(targetValue).value}{formatValue(targetValue).unit}</span>
          {targetComparison && (
            <>
              <span className="text-gray-300 mx-1">·</span>
              <span className={getCurrentValue() >= targetValue ? 'text-green-600' : 'text-amber-600'}>
                {targetComparison}
              </span>
            </>
          )}
        </div>
      )}

      {/* Chart - Medium height */}
      <div className="relative w-full h-[140px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

export function GoalCardWithMetrics({
  goal,
  metrics,
  children,
  colorClass = 'bg-gray-100',
  hideHeader = false,
  editingMetricId = null,
  onEditMetric,
  onSaveMetric,
  onCancelEditMetric,
}: GoalCardWithMetricsProps) {
  const goalMetrics = metrics.filter(m => m.goal_id === goal.id);

  return (
    <div
      id={`goal-${goal.id}`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24"
    >
      {/* Goal Header */}
      {!hideHeader && (
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            {/* Number badge */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center text-xs font-bold text-white`}>
              {goal.goal_number}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {goal.title}
                </h3>
              </div>
              {goal.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Section - Only show if there are metrics */}
      {goalMetrics.length > 0 && (
        <div className="p-4 space-y-3">
          {goalMetrics.map((metric, idx) => (
            <CompactMetricCard
              key={metric.id}
              metric={metric}
              index={idx}
              isEditing={editingMetricId === metric.id}
              onEdit={onEditMetric ? () => onEditMetric(metric.id) : undefined}
              onSave={onSaveMetric ? (updates) => onSaveMetric(metric.id, updates) : undefined}
              onCancel={onCancelEditMetric}
            />
          ))}
        </div>
      )}

      {/* Nested sub-goals */}
      {children && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
