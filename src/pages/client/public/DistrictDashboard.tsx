import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import {
  Target,
  MoreHorizontal,
  Check,
  AlertTriangle
} from 'lucide-react';
import { SlidePanel } from '../../../components/SlidePanel';
import { PerformanceIndicator } from '../../../components/PerformanceIndicator';
import { AnnualProgressChart } from '../../../components/AnnualProgressChart';
import { LikertScaleChart } from '../../../components/LikertScaleChart';
import { GoalsOutlineList } from '../../../components/GoalsOutlineList';
import { NarrativeDisplay } from '../../../components/NarrativeDisplay';
import type { Goal } from '../../../lib/types';

export function DistrictDashboard() {
  const { slug } = useParams<{ slug: string }>();
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
  const getDisplayMode = (goal: Goal): 'qualitative' | 'percentage' | 'custom' => {
    return goal.overall_progress_display_mode ||
           (goal.level === 2 ? 'percentage' : 'qualitative');
  };

  return (
    <div className="min-h-screen flex flex-col antialiased text-neutral-800 bg-neutral-50">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
            {district.name}
          </h1>
          <p className="mt-2 text-base md:text-lg text-neutral-600">
            <span className="text-red-600 font-semibold">Strategic Plan 2021-2026</span>
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
            {objectives.map((goal, index) => {
              // Determine goal status using helper function
              const status = getGoalStatus(goal.indicator_text);
              const isOffTrack = status === 'off-track';

              // Gradient bar color based on status
              const gradientClass = isOffTrack
                ? 'from-amber-500 via-orange-600 to-red-600'
                : 'from-emerald-400 via-emerald-500 to-teal-500';

              return (
                <article
                  key={goal.id}
                  className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 cursor-pointer"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowSlidePanel(true);
                  }}
                >
                  {/* Top gradient bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${gradientClass}`} />

                  <div className="flex h-full flex-col p-6 md:p-7">
                    {/* Header with title and menu */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl md:text-2xl tracking-tight font-semibold text-zinc-900">
                          {goal.goal_number}. {goal.title}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                          {goal.description || 'Strategic initiatives focused on this objective'}
                        </p>

                        {/* Status badge below description */}
                        <div className="mt-3">
                          {isOffTrack ? (
                            <button className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100 hover:text-amber-800 hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50">
                              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
                              {goal.indicator_text || 'Off Track'}
                            </button>
                          ) : (
                            <button className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 hover:ring-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
                              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                              {goal.indicator_text || 'On Target'}
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/70"
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
      <footer className="mt-auto bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-medium">
                ©
              </span>
              <span>© 2025 {district?.name || 'Westside Community Schools'}</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="#" className="hover:text-neutral-900 transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-neutral-900 transition-colors">Terms</Link>
              <Link to="#" className="hover:text-neutral-900 transition-colors">Contact</Link>
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
                  {flattenedGoals.map((child: Goal, index: number) => {
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

                    const mockNarrative = index === 1 ? {
                      summary: "The Department of Education ranks schools based on State testing of Needs Improvement, Good, Great, and Excellent. The district has received a marking of Great the last three years. This past year, the district missed excellent, by .06 overall.",
                      highlights: [
                        "District received 'Great' classification for the third consecutive year",
                        "Composite scores developed from Math, ELA, and Science proficiency",
                        "Student assessments in grades 3-8 and 11th grade",
                        "Missed 'Excellent' rating by only 0.06 points"
                      ],
                      links: [
                        {
                          label: "Compare district scores to state average",
                          url: "#"
                        }
                      ],
                      dataSource: "Nebraska Department of Education District Classification"
                    } : null;

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
                              <NarrativeDisplay config={primaryMetric.visualization_config} />
                            ) : (primaryMetric.visualization_type === 'bar' && primaryMetric.visualization_config?.scaleMin) ? (
                              chartData && chartData.length > 0 && (
                                <LikertScaleChart
                                  data={chartData}
                                  title={primaryMetric.name || "Survey Results"}
                                  description={primaryMetric.description}
                                  scaleMin={primaryMetric.visualization_config?.scaleMin || 1}
                                  scaleMax={primaryMetric.visualization_config?.scaleMax || 5}
                                  scaleLabel={primaryMetric.visualization_config?.scaleLabel || '(5 high)'}
                                  targetValue={primaryMetric.target_value || primaryMetric.visualization_config?.targetValue}
                                  showAverage={true}
                                />
                              )
                            ) : (primaryMetric.visualization_type === 'number' && primaryMetric.visualization_config?._frontendType === 'ratio') ? (
                              <div className="p-6 bg-white rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-neutral-600 mb-2">{primaryMetric.name}</div>
                                  <div className="text-3xl font-bold text-neutral-900">
                                    {primaryMetric.visualization_config?.label || ''}{primaryMetric.visualization_config?.ratioValue || '1.0:1'}
                                  </div>
                                  {primaryMetric.visualization_config?.showTarget && primaryMetric.visualization_config?.targetValue && (
                                    <div className="text-sm text-neutral-500 mt-2">
                                      Target: {primaryMetric.visualization_config.label}{primaryMetric.visualization_config.targetValue}
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
                                      const decimals = primaryMetric.visualization_config?.decimals ?? 2;
                                      const value = typeof primaryMetric.visualization_config?.currentValue === 'number'
                                        ? primaryMetric.visualization_config.currentValue.toFixed(decimals)
                                        : primaryMetric.visualization_config?.currentValue || '0';
                                      return primaryMetric.visualization_config?.unit ? `${value}${primaryMetric.visualization_config.unit}` : value;
                                    })()}
                                  </div>
                                  {primaryMetric.visualization_config?.targetValue && (
                                    <div className="text-sm text-neutral-500 mt-2">
                                      Target: {primaryMetric.visualization_config.targetValue.toFixed(primaryMetric.visualization_config?.decimals ?? 2)}{primaryMetric.visualization_config?.unit || ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (primaryMetric.visualization_type === 'blog' && primaryMetric.visualization_config?._frontendType === 'narrative') ? (
                              <div className="p-6 bg-white rounded-lg">
                                <NarrativeDisplay config={primaryMetric.visualization_config} />
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
