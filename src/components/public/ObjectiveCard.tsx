import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
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

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const params = useParams<{ slug?: string }>();
  const { slug: subdomainSlug, type: subdomainType } = useSubdomain();
  const slug = params.slug || subdomainSlug || '';
  const isOnSubdomain = subdomainType === 'district';

  // Get manual status set by admin (stored in indicator_text)
  // Default to 'on-target' to match admin2 behavior
  const validStatuses = ['on-target', 'needs-attention', 'off-track', 'not-started', 'on-track', 'complete'];
  const statusText = objective.indicator_text || objective.overall_progress_custom_value;
  const manualStatus = statusText?.toLowerCase().replace(/\s+/g, '-');
  const status = validStatuses.includes(manualStatus || '')
    ? (manualStatus as 'on-target' | 'needs-attention' | 'off-track' | 'not-started' | 'on-track' | 'complete')
    : 'on-target';

  // Hover color based on status - green for positive statuses, neutral for others
  const isPositiveStatus = ['on-target', 'on-track', 'complete'].includes(status);
  const hoverColor = isPositiveStatus
    ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
    : 'group-hover:text-slate-600 dark:group-hover:text-slate-300';

  return (
    <Link
      to={buildDistrictPath(`/objective/${objective.id}`, slug, isOnSubdomain)}
      className="group block bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col h-full"
    >
      {/* Header: Icon + Status Badge */}
      <div className="flex justify-between items-start w-full mb-5">
        {/* Neutral Icon Box */}
        <div className="w-9 h-9 rounded-md border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
          <Target className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </div>
        {/* Status Badge */}
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Title with number prefix */}
      <h2 className={`text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-2 transition-colors ${hoverColor}`}>
        <span className="text-slate-400 dark:text-slate-500 font-medium mr-2">{objective.goal_number}.</span>
        {objective.title}
      </h2>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 line-clamp-3">
        {objective.description || objective.executive_summary || 'Strategic objective for organizational growth and excellence.'}
      </p>

      {/* Footer: View details with arrow animation */}
      <div className={`mt-auto flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors ${hoverColor}`}>
        View details
        <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
