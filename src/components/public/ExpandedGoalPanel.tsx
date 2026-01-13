import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Minimize2 } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { calculateStatus } from './StatusBadge';
import type { StatusType } from './StatusBadge';
import { useMetricChartData } from '../../hooks/useMetrics';
import { NarrativeDisplay } from '../NarrativeDisplay';

// Filled status badge for expanded panel
function FilledStatusBadge({ status }: { status: StatusType }) {
  const config: Record<StatusType, { bg: string; text: string; label: string }> = {
    'not-started': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Not Started' },
    'on-target': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'On Target' },
    'on-track': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'On Track' },
    'needs-attention': { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300', label: 'Needs Attention' },
    'off-track': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: 'Off Track' },
    'complete': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: 'Complete' },
  };
  const { bg, text, label } = config[status] || config['not-started'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${bg} ${text}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

interface ExpandedGoalPanelProps {
  goal: Goal;
  metrics: Metric[];
  colorClass: string;
  onClose: () => void;
}

// Chart colors matching the design
const chartColors = ['#B91C1C', '#2563EB', '#059669', '#D97706'];

// Helper to get manual status from goal
function getManualStatus(goal: Goal): StatusType {
  const validStatuses = ['on-target', 'needs-attention', 'off-track', 'not-started', 'on-track', 'complete'];
  const statusText = goal.indicator_text || goal.overall_progress_custom_value;
  const manualStatus = statusText?.toLowerCase().replace(/\s+/g, '-');
  return validStatuses.includes(manualStatus || '')
    ? (manualStatus as StatusType)
    : 'not-started';
}

// Get primary metric
function getPrimaryMetric(metrics: Metric[], goalId: string): Metric | null {
  const goalMetrics = metrics.filter(m => m.goal_id === goalId);
  if (goalMetrics.length === 0) return null;

  const primary = goalMetrics.find(m => (m as unknown as { is_primary?: boolean }).is_primary);
  if (primary) return primary;

  for (const metric of goalMetrics) {
    if (metric.current_value != null || metric.actual_value != null || metric.ytd_value != null) {
      return metric;
    }
  }

  return goalMetrics[0];
}

// Metric value helpers (same as CompactGoalSummaryCard)
function getCurrentValue(metric: Metric): number {
  if (metric.current_value != null) return metric.current_value;
  if (metric.actual_value != null) return metric.actual_value;
  if (metric.ytd_value != null) return metric.ytd_value;

  const vizConfig = metric.visualization_config as { dataPoints?: { value: number }[] } | undefined;
  if (vizConfig?.dataPoints?.length) {
    const nonZero = vizConfig.dataPoints.filter(dp => dp.value > 0);
    if (nonZero.length > 0) {
      return nonZero.reduce((sum, dp) => sum + dp.value, 0) / nonZero.length;
    }
  }

  return 0;
}

function getTargetValue(metric: Metric): number | null {
  if (metric.target_value != null) return metric.target_value;
  const vizConfig = metric.visualization_config as { targetValue?: number } | undefined;
  if (vizConfig?.targetValue != null) return vizConfig.targetValue;
  return null;
}

function formatMetricValue(metric: Metric): { value: string; unit: string } {
  const current = getCurrentValue(metric);
  const target = getTargetValue(metric);

  if (metric.metric_type === 'percent' || metric.is_percentage) {
    return { value: current.toFixed(1), unit: '%' };
  }
  if (metric.metric_type === 'rating') {
    const targetDisplay = target ?? 5.0;
    return { value: current.toFixed(2), unit: `/ ${targetDisplay.toFixed(1)}` };
  }
  if (metric.metric_type === 'currency') {
    return { value: `$${current.toLocaleString()}`, unit: '' };
  }
  if (Number.isInteger(current)) {
    return { value: current.toString(), unit: metric.unit || 'score' };
  }
  return { value: current.toFixed(2), unit: metric.unit || '' };
}

function getMetricTypeLabel(metric: Metric): string {
  if (metric.metric_type === 'rating') return 'RATING';
  if (metric.metric_type === 'percent' || metric.is_percentage) return 'CURRENT SCORE';
  if (metric.metric_type === 'currency') return 'BUDGET';
  if (metric.metric_category) return metric.metric_category.toUpperCase();
  return 'CURRENT SCORE';
}

function getMetricStatus(metric: Metric): StatusType {
  const target = getTargetValue(metric);
  if (target === null) return calculateStatus(null);

  const current = getCurrentValue(metric);
  const baseline = metric.baseline_value ?? 0;
  const range = target - baseline;
  if (range === 0) return calculateStatus(100);

  const progress = ((current - baseline) / range) * 100;
  return calculateStatus(progress);
}

// Check if metric uses narrative (text) visualization
function isNarrativeVisualization(metric: Metric): boolean {
  const vizConfig = metric.visualization_config as {
    chartType?: string;
  } | undefined;
  return vizConfig?.chartType === 'narrative';
}

// Animation delay constant - wait for parent layout animation to complete (300ms + buffer)
const ANIMATION_DELAY_MS = 350;

// Canvas chart component
function MetricChart({ metric, chartColor }: { metric: Metric; chartColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const { data: chartData } = useMetricChartData(metric.id, 5);

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
  const targetValue = getTargetValue(metric);
  const chartType = vizConfig?.chartType || 'bar';

  // Wait for parent layout animation to complete before rendering
  useEffect(() => {
    if (chartType === 'value' || chartType === 'narrative') return;

    const timer = setTimeout(() => setIsReady(true), ANIMATION_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setIsReady(false);
    };
  }, [chartType]);

  // Main chart drawing effect with ResizeObserver
  useEffect(() => {
    // Skip canvas operations for value/narrative types or if not ready
    if (!isReady || chartType === 'value' || chartType === 'narrative') return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const drawChart = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      // Use setTransform instead of scale to prevent cumulative scaling on re-renders
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let data: { label: string; value: number; isTarget?: boolean }[] = [];

      if (vizDataPoints.length > 0) {
        data = vizDataPoints
          .filter(dp => dp.value > 0)
          .map(dp => ({ label: dp.label, value: dp.value, isTarget: false }));
      } else if (chartData && chartData.length > 0) {
        data = chartData
          .filter(d => d.actual != null)
          .map(d => ({ label: d.period, value: d.actual || 0, isTarget: false }));
      } else if (metric.data_points && metric.data_points.length > 0) {
        data = metric.data_points.map(dp => ({
          label: ('date' in dp && dp.date) || ('label' in dp && dp.label) || '',
          value: dp.value || 0,
          isTarget: false,
        }));
      } else {
        const current = getCurrentValue(metric);
        const baseline = metric.baseline_value ?? current * 0.8;
        data = [
          { label: '2021', value: baseline, isTarget: false },
          { label: '2024', value: current, isTarget: false },
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
        const radius = Math.min(centerX, centerY) - 30;
        const innerRadius = radius * 0.6;

        const total = data.reduce((sum, d) => sum + d.value, 0);

        let startAngle = -Math.PI / 2;
        data.forEach((d, i) => {
          const sliceAngle = (d.value / total) * 2 * Math.PI;
          const endAngle = startAngle + sliceAngle;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
          ctx.closePath();
          ctx.fillStyle = donutColors[i % donutColors.length];
          ctx.fill();

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

        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(total.toFixed(1), centerX, centerY + 6);
        return;
      }

      const padding = { top: 24, right: 24, bottom: 32, left: 16 };
      const chartWidth = rect.width - padding.left - padding.right;
      const chartHeight = rect.height - padding.top - padding.bottom;

      const allValues = [...data.map(d => d.value), targetValue ?? 0].filter(v => v > 0);
      const maxValue = Math.max(...allValues) * 1.15;
      const minValue = 0;
      const barWidth = Math.min(chartWidth / data.length * 0.5, 60);
      const barGap = chartWidth / data.length;

      // Target label at top right
      if (targetValue != null) {
        ctx.fillStyle = '#059669';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Target: ${targetValue}`, rect.width - padding.right, 14);
      }

      // Target line (dashed green)
      if (targetValue != null && maxValue > 0) {
        const targetY = padding.top + chartHeight - ((targetValue - minValue) / (maxValue - minValue)) * chartHeight;
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(padding.left, targetY);
        ctx.lineTo(rect.width - padding.right, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Calculate points for line/area charts
      const points = data.map((d, i) => {
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
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = chartColor;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#374151';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.value.toFixed(p.value % 1 === 0 ? 0 : 2), p.x, p.y - 10);

          ctx.fillStyle = '#6B7280';
          ctx.font = '11px Inter, sans-serif';
          ctx.fillText(p.label, p.x, rect.height - 10);
        });
      } else {
        // Default: Bar chart
        data.forEach((d, i) => {
          const valueRange = maxValue - minValue;
          const barHeight = valueRange > 0 ? ((d.value - minValue) / valueRange) * chartHeight : 0;
          const x = padding.left + barGap * i + (barGap - barWidth) / 2;
          const y = padding.top + chartHeight - barHeight;

          ctx.fillStyle = chartColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 4);
          ctx.fill();

          ctx.fillStyle = '#374151';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(d.value.toFixed(d.value % 1 === 0 ? 0 : 2), x + barWidth / 2, y - 6);

          ctx.fillStyle = '#6B7280';
          ctx.font = '11px Inter, sans-serif';
          ctx.fillText(d.label, x + barWidth / 2, rect.height - 10);
        });
      }
    };

    // Initial draw
    drawChart();

    // Set up ResizeObserver to redraw on container size changes
    const observer = new ResizeObserver(() => {
      drawChart();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [isReady, metric, chartColor, chartData, vizDataPoints, targetValue, chartType]);

  // Handle 'value' visualization type
  if (chartType === 'value') {
    const displayVal = vizConfig?.displayValue || metric.current_value?.toString() || '—';
    return (
      <div className="relative w-full h-[180px] bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <span className="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {displayVal}
        </span>
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
      <div className="relative w-full h-[180px] bg-gray-50 dark:bg-slate-800 rounded-lg p-4 overflow-y-auto">
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
    <div ref={containerRef} className="relative w-full h-[180px] bg-gray-50 dark:bg-slate-800 rounded-lg">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export function ExpandedGoalPanel({
  goal,
  metrics,
  colorClass,
  onClose,
}: ExpandedGoalPanelProps) {
  const status = getManualStatus(goal);
  const primaryMetric = getPrimaryMetric(metrics, goal.id);
  const chartColor = chartColors[0]; // Use red as primary

  const formattedValue = primaryMetric ? formatMetricValue(primaryMetric) : null;
  const metricTypeLabel = primaryMetric ? getMetricTypeLabel(primaryMetric) : null;
  const metricStatus = primaryMetric ? getMetricStatus(primaryMetric) : status;
  const target = primaryMetric ? getTargetValue(primaryMetric) : null;

  // Determine status to display
  const displayStatus: StatusType = primaryMetric?.indicator_text
    ? (primaryMetric.indicator_text.toLowerCase().replace(/\s+/g, '-') as StatusType)
    : metricStatus;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-lg overflow-hidden relative"
    >
      {/* Close button - absolute positioned top-right */}
      <button
        onClick={onClose}
        aria-label="Collapse goal details"
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <Minimize2 className="w-5 h-5" />
      </button>

      {/* Header: Badge + Title inline */}
      <div className="flex items-start gap-4 p-6 pb-0">
        <div
          className={`w-12 h-12 flex-shrink-0 rounded-xl ${colorClass} text-white flex items-center justify-center text-sm font-bold shadow-sm`}
        >
          {goal.goal_number}
        </div>
        <div className="flex-1 pr-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {goal.title}
          </h3>
        </div>
      </div>

      {/* Description - below header, indented to align with title */}
      {goal.description && (
        <div className="px-6 pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 pl-16">
            {goal.description}
          </p>
        </div>
      )}

      {/* Content: Two columns */}
      <div className="p-6 pt-6">
        {primaryMetric ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Metrics */}
            <div className="space-y-3">
              {/* Status Badge */}
              <div>
                <FilledStatusBadge status={displayStatus} />
              </div>

              {isNarrativeVisualization(primaryMetric) ? (
                /* Narrative metric - show text label instead of numeric value */
                <>
                  <div>
                    <span className="text-xs font-medium tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                      TEXT CONTENT
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View the full narrative content on the right.
                    </p>
                  </div>
                </>
              ) : (
                /* Numeric metric - show value and target */
                <>
                  {/* Metric Type Label */}
                  <div>
                    <span className="text-xs font-medium tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                      {metricTypeLabel}
                    </span>
                  </div>

                  {/* Value Display */}
                  <div>
                    <span className="text-4xl font-semibold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                      {formattedValue?.value}
                    </span>
                    {formattedValue?.unit && (
                      <span className="text-xl text-gray-400 dark:text-gray-500 ml-1">
                        {formattedValue.unit}
                      </span>
                    )}
                  </div>

                  {/* Target */}
                  {target !== null && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Target: {target}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Right: Chart (UNCHANGED) */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg overflow-hidden">
              <MetricChart metric={primaryMetric} chartColor={chartColor} />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No metrics defined for this goal</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
