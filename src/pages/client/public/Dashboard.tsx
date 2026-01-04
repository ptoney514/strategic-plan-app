import { useOutletContext } from 'react-router-dom';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import { NarrativeHero } from '../../../components/public/NarrativeHero';
import { ObjectivesGrid } from '../../../components/public/ObjectivesGrid';
import type { District, Goal } from '../../../lib/types';

interface DashboardContext {
  district: District;
  objectives: Goal[];
  goals: Goal[];
}

export function Dashboard() {
  // Get context from PublicLayout
  const { district, objectives, goals } = useOutletContext<DashboardContext>();

  // Fetch metrics for the district
  const { data: metrics, isLoading: metricsLoading } = useMetricsByDistrict(district?.id || '');

  if (!district) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading district information...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Narrative Hero Section */}
      <NarrativeHero />

      {/* Objectives Grid */}
      {metricsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-6 h-64">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <ObjectivesGrid
          objectives={objectives}
          goals={goals}
          metrics={metrics || []}
        />
      )}
    </div>
  );
}
