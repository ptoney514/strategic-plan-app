import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Grid3x3,
  List,
  FileText,
  FileSpreadsheet,
  Package
} from 'lucide-react';
import { 
  useDashboardData, 
  useMetricsWithTimeSeries,
  useMetricsByCategory,
  usePerformanceTrends 
} from '../../../hooks/useDashboard';
import { DashboardStats } from '../../../components/DashboardStats';
import { MetricsChart } from '../../../components/MetricsChart';
import { GoalProgressChart } from '../../../components/GoalProgressChart';
import { MetricOverview } from '../../../components/MetricOverview';
import {
  exportMetricsToCSV,
  exportGoalsToCSV,
  exportDashboardSummary,
  exportPerformanceReport,
  exportComprehensivePackage,
  exportMetricsWithTimeSeries
} from '../../../lib/utils/export';
import type { Metric, MetricCategory, MetricStatus } from '../../../lib/types';

type ViewMode = 'grid' | 'list' | 'category';
type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export function MetricsDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MetricStatus | 'all'>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useDashboardData(slug || '');
  
  const { data: metricsWithTimeSeries } = useMetricsWithTimeSeries(slug || '');
  const { data: metricsByCategory } = useMetricsByCategory(slug || '');
  const { data: trends } = usePerformanceTrends(slug || '', timeRange);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading metrics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Failed to load dashboard</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { district, goals, metrics, stats } = dashboardData;

  // Filter metrics based on selected filters
  const filteredMetrics = metrics.filter(metric => {
    if (selectedCategory !== 'all' && metric.metric_category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && metric.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  // Calculate category distribution for pie chart
  const categoryDistribution = metricsByCategory?.map(cat => ({
    name: cat.category,
    value: cat.metrics.length,
    progress: cat.averageProgress,
  })) || [];

  // Status indicators
  const statusIndicators = {
    'on-target': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    'off-target': { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    'critical': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    'no-data': { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <Link 
            to={`/${slug}`} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {district.name}
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Measures Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time performance tracking for {district.name}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        exportDashboardSummary(goals, metrics, district, stats);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Dashboard Summary
                    </button>
                    <button
                      onClick={() => {
                        exportMetricsToCSV(metrics, district);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      All Metrics (CSV)
                    </button>
                    <button
                      onClick={() => {
                        exportGoalsToCSV(goals, district);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      All Goals (CSV)
                    </button>
                    <button
                      onClick={() => {
                        exportPerformanceReport(goals, metrics, district);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Performance Report
                    </button>
                    {metricsWithTimeSeries && (
                      <button
                        onClick={() => {
                          exportMetricsWithTimeSeries(metricsWithTimeSeries, district);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                      >
                        <Activity className="h-4 w-4" />
                        Metrics Time Series
                      </button>
                    )}
                    <div className="border-t border-border"></div>
                    <button
                      onClick={() => {
                        exportComprehensivePackage(goals, metrics, district, stats);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 font-semibold"
                    >
                      <Package className="h-4 w-4" />
                      Complete Export Package
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Metrics"
            value={stats.totalMetrics}
            icon={BarChart3}
            trend={12}
          />
          <StatCard
            label="Average Progress"
            value={`${stats.averageProgress}%`}
            icon={TrendingUp}
            trend={stats.averageProgress > 50 ? 5 : -3}
          />
          <StatCard
            label="On Track"
            value={stats.onTrackCount}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            label="Critical"
            value={stats.criticalCount}
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        {/* Filters and View Controls */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('category')}
                className={`p-2 rounded-md ${
                  viewMode === 'category' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <PieChart className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MetricCategory | 'all')}
                className="px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="enrollment">Enrollment</option>
                <option value="achievement">Achievement</option>
                <option value="discipline">Discipline</option>
                <option value="attendance">Attendance</option>
                <option value="culture">Culture</option>
                <option value="other">Other</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as MetricStatus | 'all')}
                className="px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="on-target">On Target</option>
                <option value="off-target">Off Target</option>
                <option value="critical">Critical</option>
                <option value="no-data">No Data</option>
              </select>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        {trends && (
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Performance Trends</h2>
              <div className="flex items-center gap-2">
                {trends.summary.trend === 'improving' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : trends.summary.trend === 'declining' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-600" />
                )}
                <span className={`text-sm font-medium ${
                  trends.summary.trend === 'improving' ? 'text-green-600' : 
                  trends.summary.trend === 'declining' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {trends.summary.changePercent > 0 ? '+' : ''}{trends.summary.changePercent}%
                </span>
              </div>
            </div>
            <MetricsChart 
              metrics={filteredMetrics} 
              variant="area"
              showTrend={true}
            />
          </div>
        )}

        {/* Metrics Display Based on View Mode */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMetrics.map(metric => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-card rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Metric</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Current</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Target</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Progress</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMetrics.map(metric => (
                  <MetricRow key={metric.id} metric={metric} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'category' && metricsByCategory && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Metrics by Category</h3>
              <GoalProgressChart goals={goals} variant="pie" />
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
              <div className="space-y-4">
                {metricsByCategory.map(cat => (
                  <CategoryProgress 
                    key={cat.category}
                    category={cat.category}
                    progress={cat.averageProgress}
                    count={cat.metrics.length}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Metrics with Time Series */}
        {metricsWithTimeSeries && metricsWithTimeSeries.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Detailed Metrics Analysis</h2>
            <MetricOverview metrics={metricsWithTimeSeries.slice(0, 5)} />
          </div>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  color = 'text-primary',
  bgColor = 'bg-primary/10'
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: number;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : trend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              ) : (
                <Minus className="h-4 w-4 text-gray-600 mr-1" />
              )}
              <span className={`text-sm ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ metric }: { metric: Metric }) {
  const progress = metric.target_value && metric.current_value 
    ? Math.round((metric.current_value / metric.target_value) * 100)
    : 0;

  const statusConfig = {
    'on-target': { color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
    'off-target': { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    'critical': { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    'no-data': { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
  };

  const status = metric.status || 'no-data';
  const config = statusConfig[status];

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-card-foreground">{metric.metric_name || metric.name}</h3>
          {metric.description && (
            <p className="text-sm text-muted-foreground mt-1">{metric.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
          {status.replace('-', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              progress >= 70 ? 'bg-green-600' : 
              progress >= 40 ? 'bg-yellow-600' : 
              'bg-red-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Current: {metric.current_value || 0} {metric.unit}
          </span>
          <span className="text-muted-foreground">
            Target: {metric.target_value || 0} {metric.unit}
          </span>
        </div>
      </div>
    </div>
  );
}

// Metric Row Component for List View
function MetricRow({ metric }: { metric: Metric }) {
  const progress = metric.target_value && metric.current_value 
    ? Math.round((metric.current_value / metric.target_value) * 100)
    : 0;

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      <td className="p-4">
        <div>
          <p className="font-medium">{metric.metric_name || metric.name}</p>
          {metric.description && (
            <p className="text-sm text-muted-foreground">{metric.description}</p>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm capitalize">{metric.metric_category || 'Other'}</span>
      </td>
      <td className="p-4">
        {metric.current_value || 0} {metric.unit}
      </td>
      <td className="p-4">
        {metric.target_value || 0} {metric.unit}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${
                progress >= 70 ? 'bg-green-600' : 
                progress >= 40 ? 'bg-yellow-600' : 
                'bg-red-600'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-sm">{progress}%</span>
        </div>
      </td>
      <td className="p-4">
        <StatusBadge status={metric.status || 'no-data'} />
      </td>
    </tr>
  );
}

// Category Progress Component
function CategoryProgress({ 
  category, 
  progress, 
  count 
}: { 
  category: string; 
  progress: number; 
  count: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="capitalize font-medium">{category}</span>
        <span className="text-muted-foreground">{count} metrics • {progress}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            progress >= 70 ? 'bg-green-600' : 
            progress >= 40 ? 'bg-yellow-600' : 
            'bg-red-600'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: MetricStatus }) {
  const config = {
    'on-target': { label: 'On Target', color: 'text-green-600', bg: 'bg-green-100' },
    'off-target': { label: 'Off Target', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    'critical': { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' },
    'no-data': { label: 'No Data', color: 'text-gray-600', bg: 'bg-gray-100' },
  };

  const { label, color, bg } = config[status];

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${bg} ${color}`}>
      {label}
    </span>
  );
}