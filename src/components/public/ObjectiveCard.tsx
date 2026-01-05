import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { StatusBadge } from './StatusBadge';
import { useSubdomain } from '../../contexts/SubdomainContext';
import { buildDistrictPath } from '../../lib/subdomain';

interface ObjectiveCardProps {
  objective: Goal;
  childGoals: Goal[];
  metrics: Metric[];
  index: number;
}

// Color mapping for objective cards
const colorConfig = {
  red: {
    border: 'border-t-district-red',
    badge: 'bg-district-red',
    badgeText: 'text-white',
  },
  blue: {
    border: 'border-t-district-blue',
    badge: 'bg-district-blue',
    badgeText: 'text-white',
  },
  amber: {
    border: 'border-t-district-amber',
    badge: 'bg-district-amber',
    badgeText: 'text-white',
  },
  green: {
    border: 'border-t-district-green',
    badge: 'bg-district-green',
    badgeText: 'text-white',
  },
};

// Get color based on goal's color field or default by position
function getColor(goal: Goal, index: number): keyof typeof colorConfig {
  if (goal.color && goal.color in colorConfig) {
    return goal.color as keyof typeof colorConfig;
  }
  const defaultColors: (keyof typeof colorConfig)[] = ['red', 'blue', 'amber', 'green'];
  return defaultColors[index % defaultColors.length];
}

export function ObjectiveCard({ objective, childGoals, metrics: _metrics, index }: ObjectiveCardProps) {
  const params = useParams<{ slug?: string }>();
  const { slug: subdomainSlug, type: subdomainType } = useSubdomain();
  const slug = params.slug || subdomainSlug || '';
  const isOnSubdomain = subdomainType === 'district';
  const color = getColor(objective, index);
  const colors = colorConfig[color];

  // Get manual status set by admin (stored in indicator_text)
  // Default to 'on-target' to match admin2 behavior (which shows "On Target" when no status is set)
  const validStatuses = ['on-target', 'needs-attention', 'off-track', 'not-started', 'on-track', 'complete'];
  // Use indicator_text (set via badge UI) first, fall back to overall_progress_custom_value for backwards compat
  const statusText = objective.indicator_text || objective.overall_progress_custom_value;
  const manualStatus = statusText?.toLowerCase().replace(/\s+/g, '-');
  const status = validStatuses.includes(manualStatus || '')
    ? (manualStatus as 'on-target' | 'needs-attention' | 'off-track' | 'not-started')
    : 'on-target';  // Default to on-target to match admin2

  return (
    <Link
      to={buildDistrictPath(`/objective/${objective.id}`, slug, isOnSubdomain)}
      className={`group block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-t-[3px] ${colors.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="p-6">
        {/* Header: Number badge + Title + Status Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-8 h-8 rounded-lg ${colors.badge} ${colors.badgeText} flex items-center justify-center font-display font-semibold text-sm flex-shrink-0`}
            >
              {objective.goal_number}
            </div>
            <h3 className="font-display font-semibold text-lg text-gray-900 tracking-tight group-hover:text-gray-700 transition-colors truncate">
              {objective.title}
            </h3>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {objective.description || objective.executive_summary || 'Strategic objective for organizational growth and excellence.'}
        </p>

        {/* Goals Count */}
        <div className="flex items-center gap-1 mb-4 text-xs text-gray-400">
          <Target className="w-3.5 h-3.5" />
          <span>{childGoals.length} Goals</span>
        </div>

        {/* Footer: View details */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-50">
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-district-red transition-colors">
            View details
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
