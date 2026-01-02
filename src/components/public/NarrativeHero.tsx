import type { District, Goal, Metric } from '../../lib/types';
import { calculateStatus } from './StatusBadge';

interface NarrativeHeroProps {
  district: District;
  objectives: Goal[];
  metrics: Metric[];
  planTitle?: string;
  planPeriod?: string;
  planTagline?: string;
}

export function NarrativeHero({
  district,
  objectives,
  metrics,
  planTitle = 'Our Strategic Plan',
  planPeriod = '2021-2026',
  planTagline = 'Charting our course for educational excellence through strategic pillars that guide our commitment to student success',
}: NarrativeHeroProps) {
  // Calculate status summary
  const statusCounts = objectives.reduce(
    (acc, obj) => {
      const status = calculateStatus(obj.overall_progress);
      if (status === 'on-target' || status === 'on-track' || status === 'complete') {
        acc.onTarget++;
      } else if (status === 'needs-attention') {
        acc.needsAttention++;
      } else if (status === 'off-track') {
        acc.offTrack++;
      }
      return acc;
    },
    { onTarget: 0, needsAttention: 0, offTrack: 0 }
  );

  // Get last updated from most recent metric or goal
  const getLastUpdated = () => {
    const dates = [
      ...objectives.map(o => o.updated_at),
      ...metrics.map(m => m.updated_at),
    ].filter(Boolean);

    if (dates.length === 0) return 'Recently';

    const mostRecent = dates.reduce((latest, current) => {
      return new Date(current!) > new Date(latest!) ? current : latest;
    });

    if (!mostRecent) return 'Recently';

    const date = new Date(mostRecent);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mb-12">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="font-display font-semibold text-3xl lg:text-4xl text-gray-900 tracking-tight mb-3">
          {district.name}
        </h1>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-display font-medium text-xl lg:text-2xl text-district-red">
            {planTitle}
          </span>
          <span className="px-2.5 py-1 bg-gray-100 rounded-md text-sm font-semibold text-gray-700">
            {planPeriod}
          </span>
        </div>
        <p className="text-gray-500 text-base lg:text-lg leading-relaxed max-w-3xl">
          {planTagline}
        </p>
      </div>

      {/* Narrative Content (if district has executive summary) */}
      {district.description && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <p className="text-gray-600 leading-relaxed">
            {district.description}
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {statusCounts.onTarget} objective{statusCounts.onTarget !== 1 ? 's' : ''} on target
          </span>
        </div>

        {statusCounts.needsAttention > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-gray-700">
              {statusCounts.needsAttention} need{statusCounts.needsAttention !== 1 ? '' : 's'} attention
            </span>
          </div>
        )}

        {statusCounts.offTrack > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-gray-700">
              {statusCounts.offTrack} off track
            </span>
          </div>
        )}

        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-500">Last updated {getLastUpdated()}</span>
      </div>
    </div>
  );
}
