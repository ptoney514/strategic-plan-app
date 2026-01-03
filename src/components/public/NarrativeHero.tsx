import type { Goal } from '../../lib/types';
import { calculateStatus } from './StatusBadge';

interface NarrativeHeroProps {
  objectives: Goal[];
  planTitle?: string;
}

export function NarrativeHero({
  objectives,
  planTitle = 'Our Strategic Plan',
}: NarrativeHeroProps) {
  // Calculate status summary
  const statusCounts = objectives.reduce(
    (acc, obj) => {
      const status = calculateStatus(obj.overall_progress);
      if (status === 'on-target' || status === 'on-track' || status === 'complete') {
        acc.onTarget++;
      }
      return acc;
    },
    { onTarget: 0 }
  );

  const totalObjectives = objectives.length;

  return (
    <div className="mb-12">
      {/* Title */}
      <h1 className="font-display font-semibold text-3xl lg:text-4xl text-gray-900 tracking-tight mb-8">
        {planTitle}
      </h1>

      {/* Narrative Card */}
      <div className="bg-white rounded-xl border-l-4 border-l-gray-200 border border-gray-100 px-8 py-6">
        {/* Metrics highlight paragraph */}
        <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
          Today, we're proud to report that <span className="font-display font-semibold text-xl text-district-red">{statusCounts.onTarget} of {totalObjectives}</span> strategic objectives are on target. Our students' sense of belonging has reached <span className="font-display font-semibold text-xl text-district-red">3.74</span> out of 5.0—exceeding our goal. Daily attendance stands strong at <span className="font-display font-semibold text-xl text-district-red">96.2%</span>, and we've maintained healthy cash reserves of <span className="font-display font-semibold text-xl text-district-red">$34.4M</span> to invest in our future.
        </p>
      </div>
    </div>
  );
}
