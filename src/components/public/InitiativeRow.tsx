import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { StatusBadge, calculateStatus } from './StatusBadge';

interface InitiativeRowProps {
  initiative: Goal;
  metrics: Metric[];
}

export function InitiativeRow({ initiative, metrics }: InitiativeRowProps) {
  const { slug } = useParams();
  const status = calculateStatus(initiative.overall_progress);

  // Count metrics for this initiative
  const metricCount = metrics.filter(m => m.goal_id === initiative.id).length;

  return (
    <Link
      to={`/${slug}/goal/${initiative.id}`}
      className="group block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
    >
      <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {/* Number badge */}
        <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center bg-gray-50 text-xs font-bold text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700 transition-colors">
          {initiative.goal_number}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-district-red transition-colors">
            {initiative.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {initiative.description || initiative.executive_summary || 'Strategic initiative'}
          </p>
        </div>

        {/* Meta: Metrics count + Status */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
            {metricCount} Metric{metricCount !== 1 ? 's' : ''}
          </span>
          <StatusBadge status={status} size="sm" />
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}
