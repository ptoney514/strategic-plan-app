import { useEffect, useRef } from 'react';
import type { Metric } from '../../lib/types';
import { StatusBadge, calculateStatus } from './StatusBadge';
import { useMetricChartData } from '../../hooks/useMetrics';
import { NarrativeDisplay } from '../NarrativeDisplay';

interface MetricCardProps {
  metric: Metric;
  index: number;
}

// Color palette for charts based on index
const chartColors = ['#B91C1C', '#2563EB', '#059669', '#D97706'];

export function MetricCard({ metric, index }: MetricCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartColor = chartColors[index % chartColors.length];

  // Fetch time series data for this metric (used as secondary source after visualization_config)
  const { data: chartData } = useMetricChartData(metric.id, 5);

  // Extract data from visualization_config if available
  const vizConfig = metric.visualization_config as {
    dataPoints?: { label: string; value: number }[];
    targetValue?: number;
    scaleMin?: number;
    scaleMax?: number;
    showAverage?: boolean;
    chartType?: 'bar' | 'line' | 'area' | 'donut' | 'value' | 'narrative';
    displayValue?: string;
    content?: string;
    title?: string;
    showTitle?: boolean;
  } | undefined;

  const chartType = vizConfig?.chartType || 'bar';
  const vizDataPoints = vizConfig?.dataPoints || [];
  const vizTargetValue = vizConfig?.targetValue;

  // Check if this metric has any actual data
  const hasData = (): boolean => {
    // Check direct value fields
    if (metric.current_value != null && metric.current_value !== 0) return true;
    if (metric.actual_value != null && metric.actual_value !== 0) return true;
    if (metric.ytd_value != null && metric.ytd_value !== 0) return true;

    // Check visualization_config.dataPoints
    if (vizDataPoints.length > 0 && vizDataPoints.some(dp => dp.value > 0)) return true;

    // Check time series
    if (chartData && chartData.length > 0 && chartData.some(d => d.actual != null && d.actual !== 0)) return true;

    // Check data_points
    if (metric.data_points && metric.data_points.length > 0) {
      const hasValue = metric.data_points.some(dp => 'value' in dp && dp.value != null && dp.value !== 0);
      if (hasValue) return true;
    }

    return false;
  };

  const metricHasData = hasData();

  // Get the current value with fallbacks
  const getCurrentValue = (): number => {
    // Priority: current_value > actual_value > ytd_value > viz config average > latest time series > latest data point > 0
    if (metric.current_value != null) return metric.current_value;
    if (metric.actual_value != null) return metric.actual_value;
    if (metric.ytd_value != null) return metric.ytd_value;

    // Check visualization_config.dataPoints (primary source for this schema)
    if (vizDataPoints.length > 0) {
      // Calculate average of non-zero values, or return latest value
      const nonZeroValues = vizDataPoints.filter(dp => dp.value > 0);
      if (nonZeroValues.length > 0) {
        const sum = nonZeroValues.reduce((acc, dp) => acc + dp.value, 0);
        return sum / nonZeroValues.length;
      }
    }

    // Check time series data (fetched from spb_metric_time_series)
    if (chartData && chartData.length > 0) {
      // Find the latest entry with an actual value
      for (let i = chartData.length - 1; i >= 0; i--) {
        const actual = chartData[i].actual;
        if (actual != null) {
          return actual;
        }
      }
    }

    // Check if there are data points with values
    if (metric.data_points && metric.data_points.length > 0) {
      const lastPoint = metric.data_points[metric.data_points.length - 1];
      if ('value' in lastPoint && lastPoint.value != null) {
        return lastPoint.value;
      }
    }

    return 0;
  };

  // Get target value with fallback to visualization_config
  const getTargetValue = (): number | null => {
    if (metric.target_value != null) return metric.target_value;
    if (vizTargetValue != null) return vizTargetValue;
    return null;
  };

  const targetValue = getTargetValue();

  // Format the metric value
  const formatValue = () => {
    const value = getCurrentValue();

    if (metric.metric_type === 'percent' || metric.is_percentage) {
      return { value: value.toFixed(1), unit: '%' };
    }
    if (metric.metric_type === 'rating') {
      return { value: value.toFixed(2), unit: `/ ${metric.target_value || 5.0}` };
    }
    if (metric.metric_type === 'currency') {
      return { value: `$${value.toLocaleString()}`, unit: '' };
    }
    if (Number.isInteger(value)) {
      return { value: value.toString(), unit: metric.unit || '' };
    }
    return { value: value.toFixed(2), unit: metric.unit || '' };
  };

  // Calculate target comparison
  const getTargetComparison = () => {
    if (!targetValue) return null;

    const current = getCurrentValue();
    const target = targetValue;
    const diff = current - target;

    if (Math.abs(diff) < 0.01) {
      return 'At target';
    }

    if (metric.is_higher_better !== false) {
      // Higher is better
      if (diff > 0) {
        return `+${Math.abs(diff).toFixed(2)} above`;
      }
      return `${Math.abs(diff).toFixed(2)} below`;
    } else {
      // Lower is better
      if (diff < 0) {
        return `${Math.abs(diff).toFixed(2)} better`;
      }
      return `${Math.abs(diff).toFixed(2)} above`;
    }
  };

  // Calculate status based on progress toward target
  const getStatus = () => {
    if (!targetValue) {
      return calculateStatus(null);
    }

    const current = getCurrentValue();
    const target = targetValue;
    const baseline = metric.baseline_value ?? 0;

    // Calculate progress percentage
    const range = target - baseline;
    if (range === 0) return calculateStatus(100);

    const progress = ((current - baseline) / range) * 100;
    return calculateStatus(progress);
  };

  const { value, unit } = formatValue();
  const status = getStatus();
  const targetComparison = getTargetComparison();

  // Simple bar chart using canvas
  useEffect(() => {
    // Skip canvas operations for value/narrative types
    if (chartType === 'value' || chartType === 'narrative') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display dimensions
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Chart data - prefer visualization_config.dataPoints, then time series, then data_points
    let data: { label: string; value: number; isTarget?: boolean }[] = [];

    if (vizDataPoints.length > 0) {
      // Primary source: visualization_config.dataPoints (e.g., [{label: "2023", value: 3.78}])
      data = vizDataPoints
        .filter(dp => dp.value > 0) // Filter out zero values for cleaner chart
        .map(dp => ({
          label: dp.label,
          value: dp.value,
          isTarget: false,
        }));
      // Add target bar if available from viz config or metric
      const target = targetValue;
      if (target != null) {
        data.push({ label: 'Target', value: target, isTarget: true });
      }
    } else if (chartData && chartData.length > 0) {
      // Secondary: time series data from spb_metric_time_series (years like 2023, 2024)
      data = chartData
        .filter(d => d.actual != null)
        .map(d => ({
          label: d.period,
          value: d.actual || 0,
          isTarget: false,
        }));
      // Add target bar if available
      if (targetValue != null) {
        data.push({ label: 'Target', value: targetValue, isTarget: true });
      }
    } else if (metric.data_points && metric.data_points.length > 0) {
      // Use data_points for chart (time series like 2023, 2024)
      data = metric.data_points.map(dp => ({
        label: ('date' in dp && dp.date) || ('label' in dp && dp.label) || '',
        value: dp.value || 0,
        isTarget: false,
      }));
      // Add target bar if available
      if (targetValue != null) {
        data.push({ label: 'Target', value: targetValue, isTarget: true });
      }
    } else {
      // Fallback to baseline/current/target
      const current = getCurrentValue();
      const baseline = metric.baseline_value ?? current * 0.8;
      const target = targetValue ?? current * 1.2;

      data = [
        { label: 'Baseline', value: baseline, isTarget: false },
        { label: 'Current', value: current, isTarget: false },
        { label: 'Target', value: target, isTarget: true },
      ];
    }

    // If no data at all, show empty state
    if (data.length === 0 || data.every(d => d.value === 0)) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', rect.width / 2, rect.height / 2);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Handle donut chart separately (different coordinate system)
    if (chartType === 'donut') {
      const donutColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) - 30;
      const innerRadius = radius * 0.6;

      const total = data.reduce((sum, d) => sum + d.value, 0);

      let startAngle = -Math.PI / 2;
      data.forEach((d, i) => {
        if (d.isTarget) return; // Skip target in donut
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = donutColors[i % donutColors.length];
        ctx.fill();

        // Draw label
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius + 15;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.fillStyle = '#374151';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? 'right' : 'left';
        ctx.fillText(`${d.label}: ${d.value.toFixed(1)}`, labelX, labelY);

        startAngle = endAngle;
      });

      // Draw center text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(total.toFixed(1), centerX, centerY + 6);
      return;
    }

    // Calculate chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(0, Math.min(...data.map(d => d.value)) * 0.9);
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length;

    // Draw grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Draw target line if we have one
    if (targetValue != null && maxValue > 0) {
      const targetY = padding.top + chartHeight - ((targetValue - minValue) / (maxValue - minValue)) * chartHeight;
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, targetY);
      ctx.lineTo(rect.width - padding.right, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Calculate data point positions for line/area charts
    const points = data
      .filter(d => !d.isTarget)
      .map((d, i) => {
        const valueRange = maxValue - minValue;
        const x = padding.left + barGap * i + barGap / 2;
        const y = valueRange > 0
          ? padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
          : padding.top + chartHeight;
        return { x, y, value: d.value, label: d.label };
      });

    // Draw based on chart type
    if (chartType === 'line' || chartType === 'area') {
      // Draw area fill for area chart
      if (chartType === 'area' && points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = chartColor + '30'; // 30% opacity
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
        // Point circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = chartColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Value label
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.value.toFixed(2), p.x, p.y - 10);

        // X-axis label
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(p.label, p.x, rect.height - 8);
      });
    } else {
      // Default: Bar chart
      data.forEach((d, i) => {
        if (d.isTarget) return; // Skip target bar, we draw a line instead

        const valueRange = maxValue - minValue;
        const barHeight = valueRange > 0 ? ((d.value - minValue) / valueRange) * chartHeight : 0;
        const x = padding.left + barGap * i + (barGap - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;

        // Bar color
        ctx.fillStyle = chartColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();

        // Value label on top of bar
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.value.toFixed(2), x + barWidth / 2, y - 6);

        // Label below bar
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(d.label, x + barWidth / 2, rect.height - 8);
      });
    }

    // Draw y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const gridValue = maxValue - ((maxValue - minValue) / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i + 4;
      ctx.fillText(gridValue.toFixed(1), padding.left - 8, y);
    }
  }, [metric, chartColor, chartData, vizDataPoints, targetValue, chartType]);

  // Don't render metrics without data (filtering happens at MetricsGrid level)
  if (!metricHasData) {
    return null;
  }

  // Handle 'value' visualization type
  if (chartType === 'value') {
    const displayVal = vizConfig?.displayValue || metric.current_value?.toString() || '—';
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
        {/* Header: Label + Status badge */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Value
          </span>
          {metric.indicator_text && metric.indicator_color && (
            <StatusBadge
              customText={metric.indicator_text}
              customColor={metric.indicator_color as 'green' | 'amber' | 'red' | 'gray'}
              size="sm"
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-semibold text-lg tracking-tight mb-4">
          {metric.metric_name || metric.name}
        </h3>

        {/* Display Value */}
        <div className="flex items-center justify-center py-8">
          <span className="text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
        {/* Header: Label + Status badge */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Narrative
          </span>
          {metric.indicator_text && metric.indicator_color && (
            <StatusBadge
              customText={metric.indicator_text}
              customColor={metric.indicator_color as 'green' | 'amber' | 'red' | 'gray'}
              size="sm"
            />
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-semibold text-lg tracking-tight mb-4">
          {metric.metric_name || metric.name}
        </h3>

        {/* Narrative Content */}
        {narrativeConfig.content ? (
          <NarrativeDisplay config={narrativeConfig} />
        ) : (
          <div className="text-center text-gray-400 py-8">
            No content available
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
      {/* Header: Label + Status badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          {metric.metric_type === 'rating' ? 'Rating' : metric.metric_category || 'Metric'}
        </span>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Title */}
      <h3 className="text-gray-900 font-semibold text-lg tracking-tight mb-2">
        {metric.metric_name || metric.name}
      </h3>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl lg:text-6xl font-semibold text-gray-900 tracking-tighter font-display">
          {value}
        </span>
        {unit && (
          <span className="text-xl lg:text-2xl text-gray-400 font-medium font-display">
            {unit}
          </span>
        )}
      </div>

      {/* Target line */}
      {targetValue && (
        <div className="text-sm font-medium text-gray-500 mt-3">
          Target:{' '}
          <span className="text-gray-900">
            {targetValue}
            {metric.metric_type === 'percent' || metric.is_percentage ? '%' : ''}
          </span>
          {targetComparison && (
            <>
              <span className="text-gray-300 mx-1">•</span>
              <span className={getCurrentValue() >= targetValue ? 'text-green-600' : 'text-amber-600'}>
                {targetComparison}
              </span>
            </>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="relative w-full h-44 mt-6">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
