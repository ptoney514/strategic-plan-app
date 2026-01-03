import type { District, Goal, Metric } from '../../lib/types';
import { calculateStatus } from './StatusBadge';

interface NarrativeHeroProps {
  district: District;
  objectives: Goal[];
  metrics: Metric[];
  planTitle?: string;
}

export function NarrativeHero({
  district,
  objectives,
  metrics,
  planTitle = 'Our Strategic Plan',
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
      month: 'long',
      year: 'numeric',
    });
  };

  const totalObjectives = objectives.length;

  return (
    <div className="mb-12">
      {/* Title */}
      <h1 className="font-display font-semibold text-3xl lg:text-4xl text-gray-900 tracking-tight mb-8">
        {planTitle}
      </h1>

      {/* Narrative Card */}
      <div className="bg-white rounded-xl border-l-4 border-l-gray-200 border border-gray-100 px-8 py-6">
        {/* Opening paragraph */}
        <p className="text-gray-700 text-base lg:text-lg leading-relaxed mb-6">
          In August 2021, {district.name} launched a five-year strategic plan built on input from teachers, staff, parents, students, and community members. From the start, our committee made a commitment: <strong className="text-gray-900">progress would be shared openly and regularly with our community.</strong>
        </p>

        {/* Metrics highlight paragraph */}
        <p className="text-gray-700 text-base lg:text-lg leading-relaxed mb-6">
          Today, we're proud to report that <span className="font-display font-semibold text-xl text-district-red">{statusCounts.onTarget} of {totalObjectives}</span> strategic objectives are on target. Our students' sense of belonging has reached <span className="font-display font-semibold text-xl text-district-red">3.74</span> out of 5.0—exceeding our goal. Daily attendance stands strong at <span className="font-display font-semibold text-xl text-district-red">96.2%</span>, and we've maintained healthy cash reserves of <span className="font-display font-semibold text-xl text-district-red">$34.4M</span> to invest in our future.
        </p>

        {/* Areas needing attention paragraph */}
        {statusCounts.needsAttention > 0 && (
          <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
            We're also honest about where we have work to do. Student wellbeing and safety metrics need our attention, and we're actively addressing this through expanded mental health support and updated safety protocols.
          </p>
        )}

        {/* Divider and status summary */}
        <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-gray-700">
              {statusCounts.onTarget} objective{statusCounts.onTarget !== 1 ? 's' : ''} on target
            </span>
          </div>

          {statusCounts.needsAttention > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-gray-700">
                {statusCounts.needsAttention} needs attention
              </span>
            </div>
          )}

          {statusCounts.offTrack > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-gray-700">
                {statusCounts.offTrack} off track
              </span>
            </div>
          )}

          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-400">Last updated {getLastUpdated()}</span>
        </div>
      </div>
    </div>
  );
}
