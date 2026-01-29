import { useOutletContext } from 'react-router-dom';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import {
  HierarchicalTemplate,
  MetricsGridTemplate,
  LaunchTractionTemplate,
} from '../../../components/public/templates';
import { getMergedConfig } from '../../../components/public/templates/TemplateRegistry';
import type { District, Goal, DashboardConfig } from '../../../lib/types';

interface DashboardContext {
  district: District;
  objectives: Goal[];
  goals: Goal[];
  templateConfig?: DashboardConfig;
}

export function Dashboard() {
  // Get context from PublicLayout
  const { district, objectives, goals, templateConfig: layoutConfig } = useOutletContext<DashboardContext>();

  // Fetch metrics for the district
  const { data: metrics, isLoading: metricsLoading } = useMetricsByDistrict(district?.id || '');

  if (!district) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-slate-400">Loading district information...</p>
      </div>
    );
  }

  // Get template and config
  const template = district.dashboard_template || 'hierarchical';
  const config = layoutConfig || getMergedConfig(template, district.dashboard_config);

  // Render the appropriate template based on configuration
  const renderTemplate = () => {
    switch (template) {
      case 'launch-traction':
        return (
          <LaunchTractionTemplate
            district={district}
            metrics={metrics || []}
            config={config}
            isLoading={metricsLoading}
          />
        );

      case 'metrics-grid':
        return (
          <MetricsGridTemplate
            district={district}
            metrics={metrics || []}
            config={config}
            isLoading={metricsLoading}
          />
        );

      case 'hierarchical':
      default:
        return (
          <HierarchicalTemplate
            district={district}
            objectives={objectives}
            goals={goals}
            metrics={metrics || []}
            config={config}
            isLoading={metricsLoading}
          />
        );
    }
  };

  return <div>{renderTemplate()}</div>;
}
