import type { Metric } from '../../lib/types';
import { MetricCard } from './MetricCard';

interface MetricsGridProps {
  metrics: Metric[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-gray-500">No metrics available for this goal.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {metrics.map((metric, index) => (
        <MetricCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  );
}
