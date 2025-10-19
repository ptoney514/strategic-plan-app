import React from 'react';
import { Pencil, Trash2, BarChart3 } from 'lucide-react';
import { MetricPreview } from '../MetricPreview';
import type { Metric } from '../../lib/types';

interface MetricCardProps {
  metric: Metric;
  onEdit: () => void;
  onDelete: () => void;
}

export function MetricCard({ metric, onEdit, onDelete }: MetricCardProps) {
  const visualizationType = metric.visualization_type || 'bar-chart';
  const visualizationConfig = metric.visualization_config || {};

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {metric.metric_name || metric.name}
            </h3>
            {metric.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {metric.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
              title="Edit metric"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
              title="Delete metric"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualization Type Badge */}
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            <BarChart3 className="w-3 h-3" />
            {visualizationType.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Metric Visualization Preview */}
      <div className="p-4">
        <MetricPreview
          type={visualizationType as any}
          data={visualizationConfig}
        />
      </div>
    </div>
  );
}
