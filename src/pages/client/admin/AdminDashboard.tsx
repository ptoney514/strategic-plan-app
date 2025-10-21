import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Upload,
  RefreshCw,
  ArrowRight,
  Activity,
  Calendar,
  Users,
  Sparkles
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import { recalculateDistrictProgress } from '../../../lib/services/progressService';
import { ToastContainer, useToast, toast } from '../../../components/Toast';

export function AdminDashboard() {
  const { slug } = useParams();
  const { data: district } = useDistrict(slug!);
  const { data: goals, refetch: refetchGoals } = useGoals(district?.id || '');
  const { data: metrics } = useMetrics(district?.id || '');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { messages, removeMessage } = useToast();

  // Calculate status summary
  const statusSummary = goals?.reduce((acc, goal) => {
    const status = goal.status || 'not-started';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate metrics needing updates
  const metricsNeedingUpdates = metrics?.filter(m => {
    if (!m.last_actual_period) return true;
    const lastUpdate = new Date(m.last_actual_period);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30;
  }).length || 0;

  // Calculate overall progress average
  const overallProgress = goals?.length
    ? Math.round(
        goals.reduce((sum, goal) => sum + (goal.overall_progress || 0), 0) / goals.length
      )
    : 0;

  // Data completeness
  const dataCompleteness = metrics?.length
    ? Math.round((metrics.filter(m => m.current_value).length / metrics.length) * 100)
    : 0;

  // Handle batch recalculation
  const handleRecalculateProgress = async () => {
    if (!district?.id) return;

    setIsRecalculating(true);
    try {
      await recalculateDistrictProgress(district.id);
      await refetchGoals();
      toast.success('Progress recalculated successfully for all goals');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to recalculate progress');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Top KPI Cards - Clean Webflow-style design (no gradients)
  const kpiCards = [
    {
      title: 'Overall Progress',
      value: `${overallProgress}%`,
      subtitle: overallProgress >= 75 ? 'Excellent progress' : overallProgress >= 50 ? 'On track' : 'Needs attention',
      icon: TrendingUp,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Goals On Track',
      value: statusSummary['on-target'] || 0,
      subtitle: `${goals?.length || 0} total objectives`,
      icon: CheckCircle,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Data Completeness',
      value: `${dataCompleteness}%`,
      subtitle: `${metrics?.filter(m => m.current_value).length || 0}/${metrics?.length || 0} metrics updated`,
      icon: Activity,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Updates Due',
      value: metricsNeedingUpdates,
      subtitle: 'Metrics need review',
      icon: Clock,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Create Strategic Objective',
      description: 'Build a new objective visually',
      icon: Target,
      link: `/${slug}/admin/objectives/new`,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Import from Excel',
      description: 'Upload strategic plan data',
      icon: Upload,
      link: `/${slug}/admin/import`,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600'
    },
    {
      title: 'Review Goals',
      description: 'Quarterly status review',
      icon: Target,
      link: `/${slug}/admin/goals`,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Update Metrics',
      description: `${metricsNeedingUpdates} metrics need updating`,
      icon: BarChart3,
      link: `/${slug}/admin/metrics`,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'View Audit Trail',
      description: 'Recent changes',
      icon: FileText,
      link: `/${slug}/admin/audit`,
      iconBg: 'bg-gray-50',
      iconColor: 'text-orange-600'
    }
  ];

  // Goals needing attention
  const criticalGoals = goals?.filter(g => g.status === 'critical' || g.status === 'at-risk').slice(0, 4) || [];
  const metricsNeedingUpdate = metrics?.filter(m => {
    if (!m.last_actual_period) return true;
    const lastUpdate = new Date(m.last_actual_period);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30;
  }).slice(0, 4) || [];

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span>Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            <span>{district?.name} Strategic Plan Management</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Last updated: Just now</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Quick Actions</h2>
              <Link
                to={`/${slug}/admin/goals`}
                className="text-xs sm:text-sm text-primary hover:underline flex items-center space-x-1"
              >
                <span className="hidden sm:inline">View all</span>
                <span className="sm:hidden">All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.iconBg} flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}

              {/* Recalculate Progress Action */}
              <button
                onClick={handleRecalculateProgress}
                disabled={isRecalculating || !district}
                className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 flex-shrink-0">
                    <RefreshCw className={`h-5 w-5 text-indigo-600 ${isRecalculating ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {isRecalculating ? 'Recalculating...' : 'Recalculate Progress'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Update all goal progress values
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Goals Needing Attention */}
          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-yellow-100">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="hidden sm:inline">Goals Needing Attention</span>
                <span className="sm:hidden">Attention</span>
              </h3>
              <Link
                to={`/${slug}/admin/goals`}
                className="text-xs sm:text-sm text-primary hover:underline flex items-center space-x-1"
              >
                <span className="hidden sm:inline">View all</span>
                <span className="sm:hidden">All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {criticalGoals.length > 0 ? (
                criticalGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="group flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border hover:border-yellow-500/50 hover:bg-yellow-50/30 transition-all"
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-md flex-shrink-0 ${
                        goal.status === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <AlertCircle className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          goal.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-foreground truncate">
                          {goal.goal_number} {goal.title}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            goal.status === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {goal.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {goal.overall_progress || 0}% complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/${slug}/admin/goals?id=${goal.id}`}
                      className="ml-2 sm:ml-4 text-xs sm:text-sm text-primary hover:underline font-medium opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center space-x-1 flex-shrink-0"
                    >
                      <span className="hidden sm:inline">Review</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">All goals on track!</p>
                  <p className="text-sm mt-1">No critical items at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-4 sm:space-y-6">
          {/* Metrics Updates Due */}
          <div className="bg-white rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <span>Updates Due</span>
              </h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {metricsNeedingUpdate.length}
              </span>
            </div>

            <div className="space-y-3">
              {metricsNeedingUpdate.length > 0 ? (
                metricsNeedingUpdate.map(metric => {
                  const daysSince = metric.last_actual_period
                    ? Math.floor((Date.now() - new Date(metric.last_actual_period).getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={metric.id}
                      className="group p-2 sm:p-3 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-foreground truncate">
                            {metric.name || metric.metric_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {daysSince ? `${daysSince} days ago` : 'Never updated'}
                          </p>
                        </div>
                        <Link
                          to={`/${slug}/admin/metrics?id=${metric.id}`}
                          className="text-xs text-primary hover:underline font-medium opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          Update
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">All up to date!</p>
                </div>
              )}
            </div>

            {metricsNeedingUpdate.length > 0 && (
              <Link
                to={`/${slug}/admin/metrics`}
                className="mt-4 block text-center text-sm text-primary hover:underline font-medium"
              >
                View all metrics →
              </Link>
            )}
          </div>

          {/* System Health - Clean design without gradient */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <span>System Health</span>
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Data Quality</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{dataCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dataCompleteness}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Manual Overrides</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {goals?.filter(g => g.status_source === 'manual').length || 0}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Last Sync</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">Just now</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer messages={messages} onClose={removeMessage} />
    </div>
  );
}
