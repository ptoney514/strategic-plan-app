import { useEffect, useRef } from 'react';
import { StatusBadge } from '../public/StatusBadge';
import type { ChartType } from '../../lib/types';
import { NarrativeDisplay } from '../NarrativeDisplay';
import type { NarrativeConfig } from '../../lib/metric-visualizations';
import { formatMetricValue } from '../../lib/utils/formatMetricValue';

/** Default color palette for multi-segment charts (donut, pie) */
export const DEFAULT_CHART_COLORS = [
  '#2563EB', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

interface MetricChartPreviewProps {
  /** Display name for the metric */
  metricName: string;
  /** Current metric value */
  currentValue: number;
  /** Target value (optional, will show as dashed line if provided) */
  targetValue?: number;
  /** Year-over-year or time series data points */
  dataPoints: { label: string; value: number; target?: number }[];
  /** Type of metric for formatting */
  metricType?: 'rating' | 'percent' | 'number' | 'currency';
  /** Chart color (defaults to blue) */
  chartColor?: string;
  /** Whether higher values are better (affects comparison text) */
  isHigherBetter?: boolean;
  /** Custom badge text (overrides calculated status) */
  indicatorText?: string;
  /** Custom badge color */
  indicatorColor?: 'green' | 'amber' | 'red' | 'gray';
  /** Chart visualization type */
  chartType?: ChartType;
  /** Color palette for multi-segment charts (donut, pie). Defaults to DEFAULT_CHART_COLORS */
  chartColors?: string[];
  /** Display value for 'value' visualization type */
  displayValue?: string;
  /** Narrative config for 'narrative' visualization type */
  narrativeConfig?: NarrativeConfig;
  /** Whether to display value as percentage */
  isPercentage?: boolean;
  /** Number of decimal places to show */
  decimalPlaces?: number;
}

/**
 * MetricChartPreview - Reusable chart visualization component
 *
 * Extracted from MetricCard.tsx to provide live preview in admin interface.
 * Renders a canvas-based bar chart with data points and optional target line.
 *
 * Usage:
 * ```tsx
 * <MetricChartPreview
 *   metricName="Overall average of responses"
 *   currentValue={3.83}
 *   targetValue={3.66}
 *   dataPoints={[
 *     { label: '2021', value: 3.66 },
 *     { label: '2022', value: 3.75 },
 *     { label: '2023', value: 3.74 },
 *     { label: '2024', value: 3.83 },
 *   ]}
 *   metricType="rating"
 *   chartColor="#2563EB"
 * />
 * ```
 */
export function MetricChartPreview({
  metricName,
  currentValue,
  targetValue,
  dataPoints,
  metricType = 'number',
  chartColor = '#2563EB',
  isHigherBetter = true,
  indicatorText,
  indicatorColor,
  chartType = 'bar',
  chartColors = DEFAULT_CHART_COLORS,
  displayValue,
  narrativeConfig,
  isPercentage = false,
  decimalPlaces = 2,
}: MetricChartPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Format a value using centralized utility
  const formatValue = (value: number): { value: string; unit: string } => {
    const formatted = formatMetricValue({
      value,
      isPercentage,
      decimalPlaces,
      metricType,
      targetValue,
    });
    return { value: formatted.value, unit: formatted.unit };
  };

  // Calculate target comparison text
  const getTargetComparison = (): string | null => {
    if (!targetValue) return null;

    const diff = currentValue - targetValue;

    if (Math.abs(diff) < 0.01) {
      return 'At target';
    }

    if (isHigherBetter) {
      if (diff > 0) {
        return `+${Math.abs(diff).toFixed(2)} above`;
      }
      return `${Math.abs(diff).toFixed(2)} below`;
    } else {
      if (diff < 0) {
        return `${Math.abs(diff).toFixed(2)} better`;
      }
      return `${Math.abs(diff).toFixed(2)} above`;
    }
  };

  const { value, unit } = formatValue(currentValue);
  const targetComparison = getTargetComparison();

  // Render chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display dimensions
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size for high DPI displays
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Prepare chart data
    const data = dataPoints
      .filter(dp => dp.value > 0) // Filter out zero values for cleaner chart
      .map(dp => ({
        label: dp.label,
        value: dp.value,
      }));

    // If no data, show empty state
    if (data.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', rect.width / 2, rect.height / 2);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Handle donut chart separately
    if (chartType === 'donut') {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(centerX, centerY) - 30;
      const innerRadius = radius * 0.6;

      const total = data.reduce((sum, d) => sum + d.value, 0);
      const colors = chartColors;

      let startAngle = -Math.PI / 2;
      data.forEach((d, i) => {
        const sliceAngle = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // Draw label
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius + 15;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.fillStyle = '#374151';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? 'right' : 'left';
        const donutFormatted = formatValue(d.value);
        ctx.fillText(`${d.label}: ${donutFormatted.value}${donutFormatted.unit}`, labelX, labelY);

        startAngle = endAngle;
      });

      // Draw center text
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      const centerFormatted = formatValue(total);
      ctx.fillText(centerFormatted.value + centerFormatted.unit, centerX, centerY + 6);
      return;
    }

    // Calculate chart dimensions for bar/line/area charts
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value), targetValue || 0) * 1.1;
    const minValue = Math.min(0, Math.min(...data.map(d => d.value)) * 0.9);
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length;
    const gridLines = 4;

    // Draw grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }

    // Draw target line if provided
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

      // Target label
      ctx.fillStyle = '#10B981';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Target', rect.width - padding.right + 5, targetY + 4);
    }

    // Calculate data point positions
    const points = data.map((d, i) => {
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
        const pointFormatted = formatValue(p.value);
        ctx.fillText(pointFormatted.value + pointFormatted.unit, p.x, p.y - 10);

        // X-axis label
        ctx.fillStyle = '#6B7280';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(p.label, p.x, rect.height - 8);
      });
    } else {
      // Default: Bar chart
      data.forEach((d, i) => {
        const valueRange = maxValue - minValue;
        const barHeight = valueRange > 0 ? ((d.value - minValue) / valueRange) * chartHeight : 0;
        const x = padding.left + barGap * i + (barGap - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;

        // Bar
        ctx.fillStyle = chartColor;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();

        // Value label on top of bar
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        const barFormatted = formatValue(d.value);
        ctx.fillText(barFormatted.value, x + barWidth / 2, y - 6);

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
      const yAxisFormatted = formatValue(gridValue);
      ctx.fillText(yAxisFormatted.value, padding.left - 8, y);
    }
  }, [dataPoints, targetValue, chartColor, chartType, chartColors, isPercentage, decimalPlaces, metricType]);

  // Handle 'value' visualization type
  if (chartType === 'value') {
    return (
      <div className="bg-[#fafaf8] border border-[#e8e6e1] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-widest text-[#8a8a8a] uppercase">
            Value
          </span>
          {indicatorText && indicatorColor && (
            <StatusBadge customText={indicatorText} customColor={indicatorColor} size="sm" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-[#1a1a1a] font-semibold text-lg tracking-tight mb-4">
          {metricName}
        </h3>

        {/* Display Value */}
        <div className="flex items-center justify-center py-8">
          <span className="text-5xl font-bold text-[#1a1a1a] tracking-tight">
            {displayValue || currentValue || '—'}
          </span>
        </div>
      </div>
    );
  }

  // Handle 'narrative' visualization type
  if (chartType === 'narrative') {
    return (
      <div className="bg-[#fafaf8] border border-[#e8e6e1] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-widest text-[#8a8a8a] uppercase">
            Narrative
          </span>
          {indicatorText && indicatorColor && (
            <StatusBadge customText={indicatorText} customColor={indicatorColor} size="sm" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-[#1a1a1a] font-semibold text-lg tracking-tight mb-4">
          {metricName}
        </h3>

        {/* Narrative Content */}
        {narrativeConfig ? (
          <NarrativeDisplay config={narrativeConfig} />
        ) : (
          <div className="text-center text-gray-400 py-8">
            No content entered yet
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf8] border border-[#e8e6e1] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-widest text-[#8a8a8a] uppercase">
          {metricType === 'rating' ? 'Rating' : metricType === 'percent' ? 'Percentage' : 'Metric'}
        </span>
        {indicatorText && indicatorColor && (
          <StatusBadge customText={indicatorText} customColor={indicatorColor} size="sm" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-[#1a1a1a] font-semibold text-lg tracking-tight mb-2">
        {metricName}
      </h3>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-5xl font-semibold text-[#1a1a1a] tracking-tighter font-display">
          {value}
        </span>
        {unit && (
          <span className="text-xl text-[#8a8a8a] font-medium font-display">
            {unit}
          </span>
        )}
      </div>

      {/* Target line */}
      {targetValue && (
        <div className="text-sm font-medium text-[#6a6a6a] mb-4">
          Target:{' '}
          <span className="text-[#1a1a1a]">
            {formatValue(targetValue).value}
            {formatValue(targetValue).unit}
          </span>
          {targetComparison && (
            <>
              <span className="text-[#d4d1cb] mx-1">•</span>
              <span className={currentValue >= targetValue ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
                {targetComparison}
              </span>
            </>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="relative w-full h-44">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
