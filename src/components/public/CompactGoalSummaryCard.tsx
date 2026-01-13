import type { Goal, Metric } from '../../lib/types';
import { TrendingUp, TrendingDown, Check } from 'lucide-react';

interface CompactGoalSummaryCardProps {
  goal: Goal;
  metrics: Metric[];
  colorClass: string;
  isExpanded: boolean;
  onClick: () => void;
}

// Comparison badge component (outline style)
function ComparisonBadge({ comparison }: {
  comparison: { icon: 'check' | 'up' | 'down' | 'neutral'; text: string } | null
}) {
  if (!comparison) return null;

  const isPositive = comparison.icon === 'check' || comparison.icon === 'up';
  const borderColor = isPositive
    ? 'border-green-200 dark:border-green-800'
    : 'border-amber-200 dark:border-amber-700';
  const textColor = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-amber-600 dark:text-amber-400';
  const bgColor = isPositive
    ? 'bg-green-50 dark:bg-green-950'
    : 'bg-amber-50 dark:bg-amber-950';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${borderColor} ${textColor} ${bgColor}`}>
      {comparison.icon === 'check' && <Check className="w-3 h-3" />}
      {comparison.icon === 'up' && <TrendingUp className="w-3 h-3" />}
      {comparison.icon === 'down' && <TrendingDown className="w-3 h-3" />}
      {comparison.text}
    </span>
  );
}

// Get primary metric (first with data)
function getPrimaryMetric(metrics: Metric[], goalId: string): Metric | null {
  const goalMetrics = metrics.filter(m => m.goal_id === goalId);
  if (goalMetrics.length === 0) return null;

  // Prefer metric marked as primary, otherwise first with data
  const primary = goalMetrics.find(m => (m as unknown as { is_primary?: boolean }).is_primary);
  if (primary) return primary;

  // Find first metric with actual data
  for (const metric of goalMetrics) {
    if (metric.current_value != null || metric.actual_value != null || metric.ytd_value != null) {
      return metric;
    }
    const vizConfig = metric.visualization_config as { dataPoints?: { value: number }[] } | undefined;
    if (vizConfig?.dataPoints?.some(dp => dp.value > 0)) {
      return metric;
    }
  }

  return goalMetrics[0];
}

// Extract current value from metric with fallbacks
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

// Get target value from metric
function getTargetValue(metric: Metric): number | null {
  if (metric.target_value != null) return metric.target_value;
  const vizConfig = metric.visualization_config as { targetValue?: number } | undefined;
  if (vizConfig?.targetValue != null) return vizConfig.targetValue;
  return null;
}

// Format metric value based on type
function formatMetricValue(metric: Metric): { value: string; unit: string } {
  const current = getCurrentValue(metric);
  const target = getTargetValue(metric);

  if (metric.metric_type === 'percent' || metric.is_percentage) {
    return { value: current.toFixed(1), unit: ' %' };
  }
  if (metric.metric_type === 'rating') {
    const targetDisplay = target ?? 5.0;
    return { value: current.toFixed(2), unit: `/ ${targetDisplay.toFixed(2)}` };
  }
  if (metric.metric_type === 'currency') {
    return { value: `$${current.toLocaleString()}`, unit: '' };
  }
  if (Number.isInteger(current)) {
    return { value: current.toString(), unit: metric.unit || 'score' };
  }
  return { value: current.toFixed(2), unit: metric.unit || '' };
}

// Get metric type label for display
function getMetricTypeLabel(metric: Metric): string {
  if (metric.metric_type === 'rating') return 'RATING';
  if (metric.metric_type === 'percent' || metric.is_percentage) return 'COMPLETION';
  if (metric.metric_type === 'currency') return 'BUDGET';
  if (metric.metric_category) return metric.metric_category.toUpperCase();
  return 'STATUS';
}

// Get comparison indicator
function getComparisonIndicator(metric: Metric): {
  icon: 'check' | 'up' | 'down' | 'neutral';
  text: string;
} | null {
  const current = getCurrentValue(metric);
  const target = getTargetValue(metric);

  if (target === null) return null;

  const diff = current - target;
  const isHigherBetter = metric.is_higher_better !== false;

  // At target (within 1% tolerance)
  if (Math.abs(diff) < Math.abs(target * 0.01) || Math.abs(diff) < 0.01) {
    return { icon: 'check', text: 'At Target' };
  }

  if (isHigherBetter) {
    if (diff > 0) {
      return { icon: 'up', text: 'On Target' };
    } else {
      return { icon: 'down', text: `${Math.abs(diff).toFixed(2)} below` };
    }
  } else {
    // Lower is better
    if (diff < 0) {
      return { icon: 'up', text: 'On Target' };
    } else {
      return { icon: 'down', text: `${Math.abs(diff).toFixed(2)} above` };
    }
  }
}

// Helper to convert colorClass (e.g., bg-district-red) to border and text variants
function getOutlineColors(colorClass: string): { border: string; text: string } {
  // Extract the color name from bg-district-X or bg-X
  const colorMatch = colorClass.match(/bg-(?:district-)?(\w+)/);
  const color = colorMatch ? colorMatch[1] : 'red';

  // Map to appropriate Tailwind classes
  const colorMap: Record<string, { border: string; text: string }> = {
    red: { border: 'border-red-600 dark:border-red-500', text: 'text-red-600 dark:text-red-500' },
    blue: { border: 'border-blue-600 dark:border-blue-500', text: 'text-blue-600 dark:text-blue-500' },
    amber: { border: 'border-amber-600 dark:border-amber-500', text: 'text-amber-600 dark:text-amber-500' },
    green: { border: 'border-green-600 dark:border-green-500', text: 'text-green-600 dark:text-green-500' },
  };

  return colorMap[color] || colorMap.red;
}

export function CompactGoalSummaryCard({
  goal,
  metrics,
  colorClass,
  isExpanded,
  onClick,
}: CompactGoalSummaryCardProps) {
  const primaryMetric = getPrimaryMetric(metrics, goal.id);

  const formattedValue = primaryMetric ? formatMetricValue(primaryMetric) : null;
  const metricTypeLabel = primaryMetric ? getMetricTypeLabel(primaryMetric) : null;
  const comparison = primaryMetric ? getComparisonIndicator(primaryMetric) : null;

  // Get outline colors for ID badge
  const outlineColors = getOutlineColors(colorClass);

  return (
    <button
      onClick={onClick}
      aria-expanded={isExpanded}
      aria-label={`Goal ${goal.goal_number}: ${goal.title}. ${isExpanded ? 'Expanded' : 'Click to expand'}`}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
    >
      {/* Header: ID Badge + Title inline */}
      <div className="flex items-start gap-3 mb-4">
        {/* ID Badge - Outline style */}
        <div
          className={`w-10 h-10 flex-shrink-0 rounded-lg border-2 ${outlineColors.border} ${outlineColors.text} bg-transparent flex items-center justify-center text-sm font-bold`}
        >
          {goal.goal_number}
        </div>
        {/* Title inline with badge - min-h ensures consistent 3-line height */}
        <h3 className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-3 leading-snug pt-2 min-h-[3.75rem]">
          {goal.title}
        </h3>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-slate-800 mt-4 pt-3">
        {/* Metric Section */}
        {primaryMetric && formattedValue ? (
          <div className="flex items-end justify-between">
            {/* Left: Metric Type + Value */}
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase block mb-1">
                {metricTypeLabel}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                  {formattedValue.value}
                </span>
                {formattedValue.unit && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                    {formattedValue.unit}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Comparison Badge */}
            <ComparisonBadge comparison={comparison} />
          </div>
        ) : (
          /* No metrics fallback */
          <div>
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase block mb-1">
              STATUS
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No metrics defined
            </p>
          </div>
        )}
      </div>
    </button>
  );
}
