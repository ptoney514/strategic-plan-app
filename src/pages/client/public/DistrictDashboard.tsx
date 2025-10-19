import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetricsByDistrict } from '../../../hooks/useMetrics';
import {
  GraduationCap,
  Target,
  BarChart3,
  ArrowRight,
  BookOpen,
  Star,
  Users,
  HandCoins,
  Megaphone
} from 'lucide-react';
import { SlidePanel } from '../../../components/SlidePanel';
import { PerformanceIndicator } from '../../../components/PerformanceIndicator';
import { AnnualProgressChart } from '../../../components/AnnualProgressChart';
import { LikertScaleChart } from '../../../components/LikertScaleChart';
import { GoalNarrativeDetail } from '../../../components/GoalNarrativeDetail';
import { GoalsOutlineList } from '../../../components/GoalsOutlineList';
import { NarrativeDisplay } from '../../../components/NarrativeDisplay';
import type { Goal, TimeSeriesDataPoint } from '../../../lib/types';
import {
  getProgressColor,
  getProgressQualitativeLabel,
  getProgressScoreOutOf5
} from '../../../lib/types';

export function DistrictDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');
  const { data: metrics, isLoading: metricsLoading } = useMetricsByDistrict(district?.id || '');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showSlidePanel, setShowSlidePanel] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [expandedSubGoalId, setExpandedSubGoalId] = useState<string | null>(null);

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

  // Icon gradients for cards
  const cardStyles = [
    { from: 'from-emerald-500', to: 'to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    { from: 'from-sky-500', to: 'to-indigo-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-fuchsia-500', to: 'to-rose-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-amber-500', to: 'to-orange-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-violet-500', to: 'to-purple-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-cyan-500', to: 'to-blue-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
  ];

  return (
    <div className="min-h-full antialiased text-neutral-800 bg-neutral-50">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
            {district.name}
            <br />
            <span className="text-red-600">Strategic Plan 2021-2026</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-neutral-600 max-w-3xl mx-auto">
            Community. Innovation. Excellence. - Charting our course for educational excellence through strategic pillars that guide our commitment to student success
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map((goal, index) => {
              const style = cardStyles[index % cardStyles.length];
              const subGoalsCount = goal.children?.length || 0;
              const progress = goal.overall_progress_override ?? goal.overall_progress ?? 0;
              const progressColor = getProgressColor(progress);
              const displayMode = goal.overall_progress_display_mode || 'percentage';

              // Render progress label based on display mode
              const renderProgressLabel = () => {
                switch (displayMode) {
                  case 'percentage':
                    return `${Math.round(progress)}%`;
                  case 'qualitative':
                    return getProgressQualitativeLabel(progress);
                  case 'score':
                    return `${getProgressScoreOutOf5(progress)}/5.00`;
                  case 'custom':
                    return goal.overall_progress_custom_value || `${Math.round(progress)}%`;
                  case 'color-only':
                    return null; // No label for color-only mode
                  case 'hidden':
                    return null;
                  default:
                    return `${Math.round(progress)}%`;
                }
              };

              const progressLabel = renderProgressLabel();

              return (
                <article
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowSlidePanel(true);
                  }}
                  className="group relative rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-all shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
                >
                  {/* Header Visual - Image or Color */}
                  {(goal.image_url || goal.header_color) && (
                    <div className="h-32 w-full relative">
                      {goal.image_url ? (
                        <img
                          src={goal.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : goal.header_color ? (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: goal.header_color }}
                        />
                      ) : null}
                    </div>
                  )}

                  <div className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400/30 via-sky-400/30 to-indigo-500/30 blur-2xl"></div>
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${style.from} ${style.to} text-white flex items-center justify-center shadow-sm`}>
                        {index === 0 ? <GraduationCap className="h-5 w-5" /> :
                         index === 1 ? <BarChart3 className="h-5 w-5" /> :
                         <BookOpen className="h-5 w-5" />}
                      </div>
                      {goal.indicator_text && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1"
                          style={{
                            backgroundColor: goal.indicator_color || '#10b981',
                            color: '#ffffff'
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                          {goal.indicator_text}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl md:text-2xl font-semibold tracking-tight text-neutral-900">
                      {goal.goal_number} - {goal.title}
                    </h3>
                    <p className="mt-3 text-neutral-600 text-sm md:text-base line-clamp-3">
                      {goal.description || 'Strategic initiatives focused on this objective'}
                    </p>

                    {/* Goal overall progress label - Only show if progress bar is enabled */}
                    {goal.show_progress_bar !== false && (
                      <div className="mt-5 flex items-center gap-4 text-sm text-neutral-600">
                        <div className="inline-flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-neutral-400" />
                          <span>Goal overall progress</span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar - Only show if enabled and not hidden mode */}
                    {goal.show_progress_bar !== false && displayMode !== 'hidden' && (
                      <div className="mt-5">
                        <div className="relative">
                          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                              className="h-full transition-all duration-700 ease-out relative"
                              style={{
                                width: `${Math.min(Math.max(progress, 0), 100)}%`,
                                background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                                boxShadow: `0 0 8px ${progressColor}40`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                            </div>
                          </div>
                        </div>
                        {/* Show label if not color-only mode */}
                        {progressLabel && (
                          <div className="mt-2 text-right">
                            <span
                              className="text-sm font-bold"
                              style={{
                                color: progressColor,
                                textShadow: `0 1px 2px ${progressColor}20`
                              }}
                            >
                              {progressLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Spacer to maintain uniform card height when progress bar is hidden */}
                    {goal.show_progress_bar === false && (
                      <div className="mt-5 h-[84px]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800 hover:text-neutral-900">
                      Annual progress click here
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Success Story */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-12 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-neutral-200 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_35px_-10px_rgba(79,70,229,0.35)]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop"
              alt=""
              className="absolute right-0 top-0 h-full w-[60%] object-cover opacity-10 hidden sm:block"
            />
          </div>
          <div className="relative p-6 md:p-10">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-medium">Success Story</span>
            </div>
            <h3 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">
              Emma's Reading Journey
            </h3>
            <p className="mt-4 max-w-3xl text-white/90 text-base md:text-lg">
              "Six months ago, Emma struggled with reading. Thanks to our new reading specialists and personalized support, she's now reading above grade level and loves picking out books at the library!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center font-medium">SJ</div>
              <div>
                <div className="text-sm font-medium">Sarah Johnson</div>
                <div className="text-sm text-white/80">Emma's Mom, Grade 2</div>
              </div>
            </div>
            <BookOpen className="absolute right-6 bottom-6 md:right-8 md:bottom-8 h-16 w-16 md:h-24 md:w-24 text-white/25" />
          </div>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-16 md:pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">How You Can Help</h2>
        <p className="mt-2 text-neutral-600">Join families, educators, and partners to strengthen each objective.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Help card 1 */}
          <div className="rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-shadow shadow-sm hover:shadow-md overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?q=80&w=1600&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Users className="h-4 w-4 text-emerald-600" />
                Volunteer &amp; Mentor
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Support tutoring, after‑school clubs, and wellness programs.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
                Get involved
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Help card 2 */}
          <div className="rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-shadow shadow-sm hover:shadow-md overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <HandCoins className="h-4 w-4 text-indigo-600" />
                Fund Classroom Needs
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Provide books, technology, and program resources.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
                See priorities
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Help card 3 */}
          <div className="rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-shadow shadow-sm hover:shadow-md overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Megaphone className="h-4 w-4 text-rose-600" />
                Share Your Story
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Celebrate wins like Emma's—and inspire others to join.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
                Submit a story
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Slide Panel for Goal Details */}
      <SlidePanel
        isOpen={showSlidePanel}
        onClose={() => {
          setShowSlidePanel(false);
          setSelectedGoal(null);
        }}
        title={selectedGoal ? `${selectedGoal.goal_number} - ${selectedGoal.title}` : 'Objective Details'}
      >
        {selectedGoal && (
          <div className="h-full flex flex-col">
            {/* Header Section - Fixed */}
            <div className="p-6 border-b border-neutral-200 space-y-4">
              {/* Visual Indicator Badge */}
              {selectedGoal.indicator_text && (
                <div className="flex justify-end">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1"
                    style={{
                      backgroundColor: selectedGoal.indicator_color || '#10b981',
                      color: '#ffffff'
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                    {selectedGoal.indicator_text}
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {selectedGoal.description || 'Strategic initiatives focused on this objective'}
                </p>
              </div>

              {/* Goal Overall Progress */}
              {(() => {
                const progress = selectedGoal.overall_progress_override ?? selectedGoal.overall_progress ?? 0;
                const progressColor = getProgressColor(progress);
                const displayMode = selectedGoal.overall_progress_display_mode || 'percentage';

                // Render progress label based on display mode
                const renderProgressLabel = () => {
                  switch (displayMode) {
                    case 'percentage':
                      return `${Math.round(progress)}%`;
                    case 'qualitative':
                      return getProgressQualitativeLabel(progress);
                    case 'score':
                      return `${getProgressScoreOutOf5(progress)}/5.00`;
                    case 'custom':
                      return selectedGoal.overall_progress_custom_value || `${Math.round(progress)}%`;
                    case 'color-only':
                      return null;
                    case 'hidden':
                      return null;
                    default:
                      return `${Math.round(progress)}%`;
                  }
                };

                const progressLabel = renderProgressLabel();

                // Only show if progress bar is enabled and not hidden mode
                if (selectedGoal.show_progress_bar === false || displayMode === 'hidden') {
                  return null;
                }

                return (
                  <div className="mt-4">
                    {/* Progress Label */}
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                      <div className="inline-flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-neutral-400" />
                        <span>Goal overall progress</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="h-full transition-all duration-700 ease-out relative"
                          style={{
                            width: `${Math.min(Math.max(progress, 0), 100)}%`,
                            background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                            boxShadow: `0 0 8px ${progressColor}40`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                        </div>
                      </div>
                    </div>
                    {/* Show label if not color-only mode */}
                    {progressLabel && (
                      <div className="mt-2 text-right">
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: progressColor,
                            textShadow: `0 1px 2px ${progressColor}20`
                          }}
                        >
                          {progressLabel}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
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
              {selectedGoal.children && selectedGoal.children.length > 0 ? (
                <div className="space-y-4">
                  {selectedGoal.children.map((child: any, index: number) => {
                    const childProgress = child.overall_progress_override ?? child.overall_progress ?? 0;
                    const isExpanded = expandedGoalId === child.id;

                    // Get real metrics for this goal (only one metric per goal)
                    const goalMetrics = metrics?.filter(m => m.goal_id === child.id) || [];
                    const primaryMetric = goalMetrics[0]; // Only one metric per goal now

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
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                              <span className="text-base font-bold text-white">
                                {child.goal_number}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-neutral-900 mb-1">{child.title}</h4>
                              {child.description && !isExpanded && (
                                <p className="text-sm text-neutral-600 mb-2">{child.description}</p>
                              )}
                            </div>
                            {child.indicator_text && (
                              <div className="flex-shrink-0">
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
                              displayMode={child.overall_progress_display_mode || 'qualitative'}
                              customValue={child.overall_progress_custom_value}
                              showLabels={true}
                            />
                          )}
                        </div>

                        {/* Metric Visualization - Always show if metrics exist */}
                        {primaryMetric && (
                          <div className="border-t border-neutral-200 p-5 bg-neutral-50">
                            {primaryMetric.visualization_type === 'narrative' ? (
                              <NarrativeDisplay config={primaryMetric.visualization_config} />
                            ) : primaryMetric.visualization_type === 'likert-scale' ? (
                              chartData && chartData.length > 0 && (
                                <LikertScaleChart
                                  data={chartData}
                                  title={primaryMetric.metric_name || "Survey Results"}
                                  description={primaryMetric.description}
                                  scaleMin={primaryMetric.visualization_config?.scaleMin || 1}
                                  scaleMax={primaryMetric.visualization_config?.scaleMax || 5}
                                  scaleLabel={primaryMetric.visualization_config?.scaleLabel || '(5 high)'}
                                  targetValue={primaryMetric.target_value || primaryMetric.visualization_config?.targetValue}
                                  showAverage={true}
                                />
                              )
                            ) : (
                              chartData && chartData.length > 0 && (
                                <AnnualProgressChart
                                  data={chartData}
                                  title={primaryMetric?.metric_name || "Annual Progress"}
                                  description={primaryMetric?.description || "Year-over-year progress tracking"}
                                  unit={primaryMetric?.unit || ""}
                                />
                              )
                            )}
                          </div>
                        )}

                        {/* Level 2 Sub-goals (e.g., 1.1.1, 1.1.2) - Always show if they exist */}
                        {child.children && child.children.length > 0 && (
                          <div className="border-t border-neutral-200 p-5 bg-neutral-50">
                            <div className="space-y-4">
                              {/* Sub-goals section */}
                              {child.children && child.children.length > 0 && (
                                <div className="space-y-3 pt-4">
                                  {child.children.map((subGoal: any) => {
                                    const isSubExpanded = expandedSubGoalId === subGoal.id;
                                    const subGoalProgress = subGoal.overall_progress_override ?? subGoal.overall_progress ?? 0;

                                    // Get real metrics for this sub-goal (only one metric per goal)
                                    const subGoalMetrics = metrics?.filter(m => m.goal_id === subGoal.id) || [];
                                    const primarySubMetric = subGoalMetrics[0]; // Only one metric per goal now

                                    // Debug logging
                                    if (subGoal.goal_number === '1.1.1') {
                                      console.log('[DistrictDashboard] Sub-goal 1.1.1 metrics:', {
                                        subGoalId: subGoal.id,
                                        totalMetrics: metrics?.length,
                                        subGoalMetrics: subGoalMetrics,
                                        primarySubMetric: primarySubMetric
                                      });
                                    }

                                    // Convert metric visualization_config.dataPoints to chart data format
                                    const subDataPoints = primarySubMetric?.visualization_config?.dataPoints ||
                                                         primarySubMetric?.data_points;

                                    const subChartData = subDataPoints && Array.isArray(subDataPoints) ?
                                      subDataPoints.map((dp: any) => ({
                                        year: dp.period || dp.date || dp.label || '',
                                        value: Number(dp.value) || 0,
                                        target: Number(dp.target || primarySubMetric?.target_value) || undefined
                                      })).filter(d => d.year) // Only include entries with a year/date
                                      : null;

                                    return (
                                      <div key={subGoal.id} className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
                                        <div className="p-4">
                                          <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                              <span className="text-base font-bold text-white">
                                                {subGoal.goal_number}
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h5 className="text-lg font-semibold text-neutral-900">{subGoal.title}</h5>
                                              {subGoal.description && (
                                                <p className="text-xs text-neutral-600 mt-1">{subGoal.description}</p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Performance Indicator for Sub-goal - Only show if enabled, no click action */}
                                          {subGoal.show_progress_bar !== false && (
                                            <PerformanceIndicator
                                              progress={subGoalProgress}
                                              displayMode={subGoal.overall_progress_display_mode || 'percentage'}
                                              customValue={subGoal.overall_progress_custom_value}
                                              showLabels={false}
                                            />
                                          )}
                                        </div>

                                        {/* Metric Visualization - Show single metric with proper card styling */}
                                        {primarySubMetric && (() => {
                                          // Prepare chart data if needed
                                          const metricDataPoints = primarySubMetric.visualization_config?.dataPoints || primarySubMetric.data_points;
                                          const metricChartData = metricDataPoints && Array.isArray(metricDataPoints) ?
                                            metricDataPoints.map((dp: any) => ({
                                              year: dp.period || dp.date || dp.label || '',
                                              value: Number(dp.value) || 0,
                                              target: Number(dp.target || primarySubMetric.target_value) || undefined
                                            })).filter(d => d.year) : null;

                                          return (
                                            <div className="border-t border-neutral-300">
                                              {primarySubMetric.visualization_type === 'narrative' ? (
                                                <div className="p-5 bg-neutral-50">
                                                  <NarrativeDisplay config={primarySubMetric.visualization_config} />
                                                </div>
                                              ) : primarySubMetric.visualization_type === 'number' ? (
                                                <div className="p-6 bg-white">
                                                  <div className="text-center">
                                                    <div className="text-sm font-medium text-neutral-600 mb-2">
                                                      {primarySubMetric.metric_name}
                                                    </div>
                                                    <div className="text-5xl font-bold text-neutral-900 mb-1">
                                                      {primarySubMetric.visualization_config?.currentValue || 0}
                                                    </div>
                                                    {primarySubMetric.visualization_config?.label && (
                                                      <div className="text-base text-neutral-600 mt-2">
                                                        {primarySubMetric.visualization_config.label}
                                                      </div>
                                                    )}
                                                    {primarySubMetric.visualization_config?.targetValue && (
                                                      <div className="text-sm text-neutral-500 mt-2">
                                                        Target: {primarySubMetric.visualization_config.targetValue}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ) : primarySubMetric.visualization_type === 'ratio' ? (
                                                <div className="p-6 bg-white">
                                                  <div className="text-center">
                                                    <div className="text-xl font-bold text-neutral-900 leading-relaxed">
                                                      {primarySubMetric.visualization_config?.label || ''}{primarySubMetric.visualization_config?.ratioValue || '1.0:1'}
                                                    </div>
                                                    {primarySubMetric.visualization_config?.showTarget && primarySubMetric.visualization_config?.targetValue && (
                                                      <div className="text-sm text-neutral-500 mt-3">
                                                        Target: {primarySubMetric.visualization_config.label}{primarySubMetric.visualization_config.targetValue}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ) : (metricChartData && metricChartData.length > 0) ? (
                                                <div className="p-5 bg-neutral-50">
                                                  {primarySubMetric.visualization_type === 'likert-scale' ? (
                                                    <LikertScaleChart
                                                      data={metricChartData}
                                                      title={primarySubMetric.metric_name || "Survey Results"}
                                                      description={primarySubMetric.description}
                                                      scaleMin={primarySubMetric.visualization_config?.scaleMin || 1}
                                                      scaleMax={primarySubMetric.visualization_config?.scaleMax || 5}
                                                      scaleLabel={primarySubMetric.visualization_config?.scaleLabel || '(5 high)'}
                                                      targetValue={primarySubMetric.target_value || primarySubMetric.visualization_config?.targetValue}
                                                      showAverage={true}
                                                    />
                                                  ) : (
                                                    <AnnualProgressChart
                                                      data={metricChartData}
                                                      title={primarySubMetric.metric_name || "Annual Progress"}
                                                      description={primarySubMetric.description || "Year-over-year progress tracking"}
                                                      unit={primarySubMetric.unit || ""}
                                                    />
                                                  )}
                                                </div>
                                              ) : null}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
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
