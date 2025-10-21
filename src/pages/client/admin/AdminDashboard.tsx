import { useParams, Link } from 'react-router-dom';
import {
  Target,
  Building2,
  BarChart3,
  Upload,
  Palette,
  Eye,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';

/**
 * AdminDashboard - Simplified, clean dashboard for district/school admins
 * Focus: Content overview + quick actions (no project management features)
 * This is a REPORTING TOOL, not a project management tool
 *
 * Note: This dashboard works for both district admins and school admins.
 * The layout and actions are the same, just scoped differently.
 */
export function AdminDashboard() {
  const { slug } = useParams();
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');
  const { data: metrics, isLoading: metricsLoading } = useMetrics(district?.id || '');

  const isLoading = districtLoading || goalsLoading || metricsLoading;

  // Simple content counts
  const stats = [
    {
      label: 'Strategic Objectives',
      value: goals?.filter(g => g.level === 0).length || 0,
      icon: Target,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Goals',
      value: goals?.filter(g => g.level === 1).length || 0,
      icon: Target,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      label: 'Metrics',
      value: metrics?.length || 0,
      icon: BarChart3,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  // Quick action cards - focused on content creation and management
  const actions = [
    {
      title: 'Create Objective',
      description: 'Build a new strategic objective',
      icon: Target,
      link: `/${slug}/admin/objectives/new`,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Manage Goals',
      description: 'View and edit all goals',
      icon: Target,
      link: `/${slug}/admin/goals`,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Manage Schools',
      description: 'View all schools in district',
      icon: Building2,
      link: `/${slug}/admin/schools`,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Import Data',
      description: 'Upload from Excel template',
      icon: Upload,
      link: `/${slug}/admin/import`,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    {
      title: 'Customize Branding',
      description: 'Update colors and visuals',
      icon: Palette,
      link: `/${slug}/admin/settings`,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'View Public Site',
      description: 'See your published plan',
      icon: Eye,
      link: `/${slug}`,
      iconBg: 'bg-gray-50',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{district?.name} Strategic Plan</p>
      </div>

      {/* Overview Stats - 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      <p className="text-lg text-gray-400">Loading...</p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions - 6 cards in grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${action.iconBg} flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Getting Started</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Create strategic objectives and goals using the wizard</li>
          <li>• Add metrics to track progress toward each goal</li>
          <li>• Manage your schools and their independent strategic plans</li>
          <li>• Customize branding to match your district identity</li>
          <li>• Publish your strategic plan for public viewing</li>
        </ul>
      </div>
    </div>
  );
}
