import { useEffect, useRef } from 'react';
import { StatusBadge } from '../public/StatusBadge';

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
}: MetricChartPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Format the metric value for display
  const formatValue = (value: number): { value: string; unit: string } => {
    if (metricType === 'percent') {
      return { value: value.toFixed(1), unit: '%' };
    }
    if (metricType === 'rating') {
      return { value: value.toFixed(2), unit: `/ ${targetValue || 5.0}` };
    }
    if (metricType === 'currency') {
      return { value: `$${value.toLocaleString()}`, unit: '' };
    }
    if (Number.isInteger(value)) {
      return { value: value.toString(), unit: '' };
    }
    return { value: value.toFixed(2), unit: '' };
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

    // Calculate chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value), targetValue || 0) * 1.1;
    const minValue = Math.min(0, Math.min(...data.map(d => d.value)) * 0.9);
    const barWidth = chartWidth / data.length * 0.6;
    const barGap = chartWidth / data.length;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

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

    // Draw bars
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
      ctx.fillText(d.value.toFixed(2), x + barWidth / 2, y - 6);

      // Label below bar
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(d.label, x + barWidth / 2, rect.height - 8);
    });

    // Draw y-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const gridValue = maxValue - ((maxValue - minValue) / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i + 4;
      ctx.fillText(gridValue.toFixed(1), padding.left - 8, y);
    }
  }, [dataPoints, targetValue, chartColor]);

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
            {targetValue}
            {metricType === 'percent' ? '%' : ''}
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
