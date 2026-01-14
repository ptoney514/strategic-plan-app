import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import {
  Target,
  MoreHorizontal,
  Check,
  AlertTriangle
} from 'lucide-react';
import { ThemeToggle } from '../../../components/public/ThemeToggle';
import { SlidePanel } from '../../../components/SlidePanel';
import { PerformanceIndicator } from '../../../components/PerformanceIndicator';
import { AnnualProgressChart } from '../../../components/AnnualProgressChart';
import { LikertScaleChart } from '../../../components/LikertScaleChart';
import { GoalsOutlineList } from '../../../components/GoalsOutlineList';
import { NarrativeDisplay } from '../../../components/NarrativeDisplay';
import type { Goal } from '../../../lib/types';

export function DistrictDashboard() {
  const params = useParams<{ slug: string }>();
  const { slug: subdomainSlug } = useSubdomain();
  // Use subdomain slug (for subdomain routing) or URL param slug (for path routing)
  const slug = subdomainSlug || params.slug;
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);

  // Always call hooks in the same order - use empty string as fallback
  // The hooks have 'enabled' flags that will prevent fetching when districtId is invalid
  const districtId = district?.id ?? '';
  const { data: goals, isLoading: goalsLoading } = useGoals(districtId);
  const { data: metrics, isLoading: metricsLoading } = useMetricsByDistrict(districtId);

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showSlidePanel, setShowSlidePanel] = useState(false);

  // Flatten goal hierarchy for display - memoized to avoid recalculation
  // IMPORTANT: Must be before early returns to follow Rules of Hooks
  const flattenedGoals = useMemo(() => {
    if (!selectedGoal?.children) return [];

    const goals: Goal[] = [];
    selectedGoal.children.forEach((child: Goal) => {
      goals.push(child);
      if (child.children && child.children.length > 0) {
        goals.push(...child.children);
      }
    });
    return goals;
  }, [selectedGoal]);

  // Debug logging (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      if (metrics) {
        console.log('[DistrictDashboard] Loaded metrics:', metrics.length, metrics);
      }
      if (goals) {
        console.log('[DistrictDashboard] Loaded goals:', goals.length);
        goals.forEach(g => {
          console.log(`Goal ${g.goal_number} (level ${g.level}):`, {
            id: g.id,
            title: g.title,
            metrics_count: g.metrics?.length || 0,
            metrics: g.metrics,
            children_count: g.children?.length || 0
          });
          g.children?.forEach(c => {
            console.log(`  Child ${c.goal_number} (level ${c.level}):`, {
              id: c.id,
              title: c.title,
              metrics_count: c.metrics?.length || 0,
              metrics: c.metrics,
              children_count: c.children?.length || 0
            });
            c.children?.forEach(gc => {
              console.log(`    Grandchild ${gc.goal_number} (level ${gc.level}):`, {
                id: gc.id,
                title: gc.title,
                metrics_count: gc.metrics?.length || 0,
                metrics: gc.metrics
              });
            });
          });
        });
      }
    }
  }, [metrics, goals]);

  const isLoading = districtLoading || goalsLoading || metricsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading district data...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-neutral-600">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-neutral-900 hover:underline">
            Back to districts
          </Link>
        </div>
      </div>
    );
  }

  // Get top-level objectives (level 0)
  const objectives = goals?.filter(g => g.level === 0) || [];

  // Helper function to determine goal status from indicator text
  const getGoalStatus = (indicatorText?: string): 'off-track' | 'on-target' => {
    if (!indicatorText) return 'on-target';

    const text = indicatorText.toLowerCase().trim();
    const offTrackKeywords = ['off track', 'needs attention', 'at risk', 'critical'];

    return offTrackKeywords.some(keyword => text.includes(keyword))
      ? 'off-track'
      : 'on-target';
  };

  // Helper function to determine display mode based on goal level
  const getDisplayMode = (goal: Goal): 'qualitative' | 'percentage' | 'score' | 'color-only' | 'hidden' | 'custom' => {
    return goal.overall_progress_display_mode ||
           (goal.level === 2 ? 'percentage' : 'qualitative');
  };

  return (
    <div className="min-h-screen flex flex-col antialiased text-neutral-800 dark:text-slate-200 bg-neutral-50 dark:bg-slate-950">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-12 md:py-16">
        {/* Theme Toggle positioned top-right */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8">
          <ThemeToggle variant="default" />
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-slate-100">
            {district.name}
          </h1>
          <p className="mt-2 text-base md:text-lg text-neutral-600 dark:text-slate-400">
            <span className="text-red-600 dark:text-red-400 font-semibold">Strategic Plan 2021-2026</span>
          </p>
        </div>
      </section>

      {/* Objectives Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-12 md:pb-16">
        {!objectives || objectives.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-xl text-neutral-600">No strategic goals available</p>
            <p className="text-sm text-neutral-500 mt-2">
              Strategic objectives are being developed
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {objectives.map((goal) => {
              // Determine goal status using helper function
              const status = getGoalStatus(goal.indicator_text);
              const isOffTrack = status === 'off-track';

              // Use saved indicator_color, or fall back to status-based colors
              const badgeColor = goal.indicator_color || (isOffTrack ? '#f59e0b' : '#10b981');

              return (
                <article
                  key={goal.id}
                  className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:hover:border-slate-600 cursor-pointer"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowSlidePanel(true);
                  }}
                >
                  {/* Top gradient bar - uses saved indicator_color */}
                  <div
                    className="h-1 w-full"
                    style={{ backgroundColor: badgeColor }}
                  />

                  <div className="flex h-full flex-col p-6 md:p-7">
                    {/* Header with title and menu */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl md:text-2xl tracking-tight font-semibold text-zinc-900 dark:text-slate-100">
                          {goal.goal_number}. {goal.title}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
                          {goal.description || 'Strategic initiatives focused on this objective'}
                        </p>

                        {/* Status badge below description - uses saved indicator_color */}
                        <div className="mt-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${badgeColor}20`,
                              color: badgeColor,
                              border: `1px solid ${badgeColor}40`,
                            }}
                          >
                            {isOffTrack ? (
                              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
                            ) : (
                              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                            )}
                            {goal.indicator_text || (isOffTrack ? 'Off Track' : 'On Target')}
                          </span>
                        </div>
                      </div>
                      <button
                        className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Add dropdown menu (View Details, Share Goal, etc.)
                          // For now, menu button is visual placeholder
                        }}
                        aria-label="Goal options menu"
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-neutral-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-medium">
                ©
              </span>
              <span>© 2025 {district?.name || 'Westside Community Schools'}</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="#" className="hover:text-neutral-900 dark:hover:text-slate-200 transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-neutral-900 dark:hover:text-slate-200 transition-colors">Terms</Link>
              <Link to="#" className="hover:text-neutral-900 dark:hover:text-slate-200 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Slide Panel for Goal Details */}
      <SlidePanel
        isOpen={showSlidePanel}
        onClose={() => {
          setShowSlidePanel(false);
          setSelectedGoal(null);
        }}
        title={selectedGoal ? `${selectedGoal.goal_number}. ${selectedGoal.title}` : 'Objective Details'}
        topBarColor={selectedGoal && getGoalStatus(selectedGoal.indicator_text) === 'off-track' ? 'warning' : 'success'}
      >
        {selectedGoal && (
          <div className="h-full flex flex-col">
            {/* Description and Status Badge */}
            <div className="px-6 pt-1 pb-6">
              {/* Description */}
              <p className="text-neutral-600 text-sm leading-relaxed">
                {selectedGoal.description || 'Strategic initiatives focused on this objective'}
              </p>

              {/* Status Badge */}
              {selectedGoal.indicator_text && (
                <div className="mt-3">
                  {(() => {
                    const status = getGoalStatus(selectedGoal.indicator_text);
                    const isOffTrack = status === 'off-track';

                    return isOffTrack ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {selectedGoal.indicator_text}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-300">
                        <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {selectedGoal.indicator_text}
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Goals Overview Outline - Collapsible */}
              {selectedGoal.children && selectedGoal.children.length > 0 && (
                <div className="mb-6">
                  <GoalsOutlineList
                    goals={selectedGoal.children}
                    onGoalClick={(goalId) => {
                      // Scroll to the goal section with error handling
                      try {
                        const element = document.getElementById(`goal-${goalId}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                          console.warn(`[GoalsOutlineList] Could not find goal element with id: goal-${goalId}`);
                        }
                      } catch (error) {
                        console.error('[GoalsOutlineList] Error scrolling to goal:', error);
                      }
                    }}
                  />
                </div>
              )}

              {/* Goals Section Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold">
                  Goals
                </h3>
              </div>

              {/* Goals List */}
              {flattenedGoals.length > 0 ? (
                <div className="space-y-4">
                  {flattenedGoals.map((child: Goal, _index: number) => {
                    const childProgress = child.overall_progress_override ?? child.overall_progress ?? 0;

                    // Get real metrics for this goal - prefer metrics with visualization_config
                    const goalMetrics = metrics?.filter(m => m.goal_id === child.id) || [];
                    const primaryMetric = goalMetrics.find(m => m.visualization_config) || goalMetrics[0];

                    // Convert metric visualization_config.dataPoints to chart data format
                    const dataPoints = primaryMetric?.visualization_config?.dataPoints ||
                                     primaryMetric?.data_points;

                    const chartData = dataPoints && Array.isArray(dataPoints) ?
                      dataPoints.map((dp: any) => ({
                        year: dp.period || dp.date || dp.label || '',
                        value: Number(dp.value) || 0,
                        target: Number(dp.target || primaryMetric?.target_value) || undefined
                      })).filter(d => d.year) // Only include entries with a year/date
                      : null;

                    return (
                      <div key={child.id} id={`goal-${child.id}`} className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all">
                        <div className="p-5">
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-neutral-900 mb-1">
                              {child.goal_number}. {child.title}
                            </h4>
                            {child.description && (
                              <p className="text-sm text-neutral-600 mb-2">{child.description}</p>
                            )}
                            {child.indicator_text && (
                              <div className="mt-3">
                                <span
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: child.indicator_color || '#10b981',
                                    color: '#ffffff'
                                  }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                                  {child.indicator_text}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Performance Indicator - Only show if enabled */}
                          {child.show_progress_bar !== false && (
                            <PerformanceIndicator
                              progress={childProgress}
                              displayMode={getDisplayMode(child)}
                              customValue={child.overall_progress_custom_value}
                              showLabels={child.level === 1}
                            />
                          )}
                        </div>

                        {/* Metric Visualization - Always show if metrics exist */}
                        {primaryMetric && (
                          <div className="border-t border-neutral-200 p-5 bg-neutral-50">
                            {primaryMetric.visualization_type === 'narrative' ? (
                              <NarrativeDisplay config={primaryMetric.visualization_config as any} />
                            ) : (primaryMetric.visualization_type === 'bar' && primaryMetric.visualization_config?.scaleMin) ? (
                              chartData && chartData.length > 0 && (
                                <LikertScaleChart
                                  data={chartData}
                                  title={primaryMetric.name || "Survey Results"}
                                  description={primaryMetric.description}
                                  scaleMin={typeof primaryMetric.visualization_config?.scaleMin === 'number' ? primaryMetric.visualization_config.scaleMin : 1}
                                  scaleMax={typeof primaryMetric.visualization_config?.scaleMax === 'number' ? primaryMetric.visualization_config.scaleMax : 5}
                                  scaleLabel={typeof primaryMetric.visualization_config?.scaleLabel === 'string' ? primaryMetric.visualization_config.scaleLabel : '(5 high)'}
                                  targetValue={primaryMetric.target_value || (typeof primaryMetric.visualization_config?.targetValue === 'number' ? primaryMetric.visualization_config.targetValue : undefined)}
                                  showAverage={true}
                                />
                              )
                            ) : (primaryMetric.visualization_type === 'number' && primaryMetric.visualization_config?._frontendType === 'ratio') ? (
                              <div className="p-6 bg-white rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-neutral-600 mb-2">{primaryMetric.name}</div>
                                  <div className="text-3xl font-bold text-neutral-900">
                                    {String(typeof primaryMetric.visualization_config?.label === 'string' ? primaryMetric.visualization_config.label : '')}{String(typeof primaryMetric.visualization_config?.ratioValue === 'string' ? primaryMetric.visualization_config.ratioValue : '1.0:1')}
                                  </div>
                                  {(primaryMetric.visualization_config as any)?.showTarget && primaryMetric.visualization_config?.targetValue && (
                                    <div className="text-sm text-neutral-500 mt-2">
                                      Target: {(() => {
                                        const label = primaryMetric.visualization_config?.label;
                                        const targetValue = primaryMetric.visualization_config?.targetValue;
                                        return String(typeof label === 'string' ? label : '') + String(typeof targetValue === 'string' ? targetValue : String(targetValue));
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (primaryMetric.visualization_type === 'number' && primaryMetric.visualization_config?._frontendType === 'number') ? (
                              <div className="p-6 bg-white rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-neutral-600 mb-2">{primaryMetric.name}</div>
                                  <div className="text-4xl font-bold text-neutral-900 mb-1">
                                    {(() => {
                                      const decimals = typeof primaryMetric.visualization_config?.decimals === 'number' ? primaryMetric.visualization_config.decimals : 2;
                                      const currentValue = primaryMetric.visualization_config?.currentValue;
                                      const value = typeof currentValue === 'number'
                                        ? currentValue.toFixed(decimals)
                                        : String(currentValue || '0');
                                      const unit = typeof primaryMetric.visualization_config?.unit === 'string' ? primaryMetric.visualization_config.unit : '';
                                      return unit ? `${value}${unit}` : value;
                                    })()}
                                  </div>
                                  {(primaryMetric.visualization_config as any)?.targetValue && (
                                    <div className="text-sm text-neutral-500 mt-2">
                                      Target: {(() => {
                                        const targetValue = (primaryMetric.visualization_config as any)?.targetValue;
                                        const decimals = typeof primaryMetric.visualization_config?.decimals === 'number' ? primaryMetric.visualization_config.decimals : 2;
                                        const unit = typeof primaryMetric.visualization_config?.unit === 'string' ? primaryMetric.visualization_config.unit : '';
                                        const formattedValue = typeof targetValue === 'number' ? targetValue.toFixed(decimals) : String(targetValue);
                                        return formattedValue + unit;
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (primaryMetric.visualization_type === 'blog' && primaryMetric.visualization_config?._frontendType === 'narrative') ? (
                              <div className="p-6 bg-white rounded-lg">
                                <NarrativeDisplay config={primaryMetric.visualization_config as any} />
                              </div>
                            ) : (
                              chartData && chartData.length > 0 && (
                                <AnnualProgressChart
                                  data={chartData}
                                  title={primaryMetric?.name || "Annual Progress"}
                                  description={primaryMetric?.description || "Year-over-year progress tracking"}
                                  unit={primaryMetric?.unit || ""}
                                />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p className="font-medium">No goals defined yet</p>
                  <p className="text-sm mt-1">Goals will appear here once they are added to this objective.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
