import type { Metric } from '../../lib/types';
import { MetricCard } from './MetricCard';

interface MetricsGridProps {
  metrics: Metric[];
}

// Check if a metric has actual data to display
function metricHasData(metric: Metric): boolean {
  // Check direct value fields
  if (metric.current_value != null && metric.current_value !== 0) return true;
  if (metric.actual_value != null && metric.actual_value !== 0) return true;
  if (metric.ytd_value != null && metric.ytd_value !== 0) return true;

  // Check visualization_config.dataPoints
  const vizConfig = metric.visualization_config as {
    dataPoints?: { label: string; value: number }[];
  } | undefined;
  if (vizConfig?.dataPoints?.some(dp => dp.value > 0)) return true;

  // Check data_points
  if (metric.data_points && metric.data_points.length > 0) {
    const hasValue = metric.data_points.some(dp => 'value' in dp && dp.value != null && dp.value !== 0);
    if (hasValue) return true;
  }

  return false;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  // Filter to only metrics with actual data
  const metricsWithData = metrics.filter(metricHasData);

  if (metricsWithData.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 mb-12">
        <p className="text-gray-400">No metrics data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {metricsWithData.map((metric, index) => (
        <MetricCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  );
}
