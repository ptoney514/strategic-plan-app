import { LayoutGrid, BarChart3, Type, Award, GraduationCap, Target, Users } from 'lucide-react';

// Components
import { VisualizationCard } from '../../../components/admin/visual-library/VisualizationCard';
import { CategorySection } from '../../../components/admin/visual-library/CategorySection';

// Dashboard Card Components
import { AnimatedCounterCard } from '../../../components/public/templates/cards/AnimatedCounterCard';
import { DonutProgressCard } from '../../../components/public/templates/cards/DonutProgressCard';
import { TrendIndicatorCard } from '../../../components/public/templates/cards/TrendIndicatorCard';
import { AreaChartCard } from '../../../components/public/templates/cards/AreaChartCard';
import { GroupedBarCard } from '../../../components/public/templates/cards/GroupedBarCard';
import { CategoryBreakdownCard } from '../../../components/public/templates/cards/CategoryBreakdownCard';
import { QuarterlyComparisonCard } from '../../../components/public/templates/cards/QuarterlyComparisonCard';
import { ProgressCounterCard } from '../../../components/public/templates/cards/ProgressCounterCard';

// Data Chart Components
import { MetricsChart } from '../../../components/MetricsChart';
import { AnnualProgressChart } from '../../../components/AnnualProgressChart';
import { GoalProgressChart } from '../../../components/GoalProgressChart';
import { LikertScaleChart } from '../../../components/LikertScaleChart';

// Mock Data
import {
  animatedCounterMetric,
  donutProgressMetric,
  donutAchievementMetric,
  trendIndicatorMetric,
  areaChartMetric,
  groupedBarMetric,
  lineChartMetrics,
  areaChartDataMetric,
  barChartMetrics,
  annualProgressData,
  goalStatusData,
  likertScaleData,
  valueDisplayMetric,
  narrativeDisplayMetric,
  categoryBreakdownMetric,
  quarterlyComparisonData,
  progressCounterData,
} from '../../../lib/mock-data/visualLibraryMocks';

/**
 * VisualLibrary - Admin page for browsing available chart and visualization types
 *
 * Serves as a reference catalog for understanding what visualizations are available
 * when configuring metrics. All charts display with sample mock data.
 */
export function VisualLibrary() {
  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visual Library</h1>
        <p className="text-slate-500 mt-1">
          Browse available chart and visualization types. Use these as reference when configuring metrics.
        </p>
      </div>

      {/* Section 1: Dashboard Cards */}
      <CategorySection
        icon={LayoutGrid}
        title="Dashboard Cards"
        description="Compact visualizations designed for dashboard grids and summary views."
        columns={3}
      >
        <VisualizationCard
          title="Animated Counter"
          description="Big number display with animated counting from 0 to target value."
          useCases={['KPIs', 'Enrollment', 'Totals']}
        >
          <div className="w-full">
            <AnimatedCounterCard
              metric={animatedCounterMetric}
              enableAnimations={true}
              animationDelay={0}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Donut Progress (Classic)"
          description="Ring chart with progress-based colors (green/amber/red)."
          useCases={['Progress', 'Budget', 'Completion']}
        >
          <div className="w-full">
            <DonutProgressCard
              metric={donutProgressMetric}
              enableAnimations={true}
              animationDelay={0}
              styleVariant="classic"
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Donut Progress (Achievement)"
          description="Fixed accent color with icon badge and raw number display."
          useCases={['Achievements', 'Hours', 'Counts']}
        >
          <div className="w-full">
            <DonutProgressCard
              metric={donutAchievementMetric}
              enableAnimations={true}
              animationDelay={0}
              styleVariant="achievement"
              icon={<Award className="w-5 h-5" />}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Trend Indicator"
          description="Current value with trend direction and subtle sparkline background."
          useCases={['Attendance', 'Rates', 'Trends']}
        >
          <div className="w-full">
            <TrendIndicatorCard
              metric={trendIndicatorMetric}
              enableAnimations={true}
              animationDelay={0}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Area Chart Card"
          description="Gradient area chart for cumulative tracking over time."
          useCases={['Proficiency', 'Growth', 'Cumulative']}
        >
          <div className="w-full">
            <AreaChartCard
              metric={areaChartMetric}
              enableAnimations={true}
              animationDelay={0}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Grouped Bar Card"
          description="Side-by-side bars comparing actual values versus targets."
          useCases={['Comparison', 'Quarterly', 'Targets']}
        >
          <div className="w-full">
            <GroupedBarCard
              metric={groupedBarMetric}
              enableAnimations={true}
              animationDelay={0}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Progress Counter"
          description="Big number with trend indicator and horizontal progress bar."
          useCases={['Attendance', 'Capacity', 'KPIs']}
        >
          <div className="w-full">
            <ProgressCounterCard
              title={progressCounterData.title}
              subtitle={progressCounterData.subtitle}
              value={progressCounterData.value}
              trendPercent={progressCounterData.trendPercent}
              trendLabel={progressCounterData.trendLabel}
              progressPercent={progressCounterData.progressPercent}
              progressLabel={progressCounterData.progressLabel}
              enableAnimations={true}
              icon={<Users className="w-5 h-5" />}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Category Breakdown"
          description="Donut chart with side legend showing category distribution."
          useCases={['Distribution', 'Breakdown', 'Comparison']}
          wide={true}
        >
          <div className="w-full">
            <CategoryBreakdownCard
              metric={categoryBreakdownMetric}
              enableAnimations={true}
              subtitle="Visit Type Breakdown"
              centerLabel="TOTAL VISITS"
              icon={<GraduationCap className="w-5 h-5" />}
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Quarterly Comparison"
          description="Grouped bar chart comparing two metrics across quarters with summary footer."
          useCases={['Quarterly', 'Conversion', 'Comparison']}
          wide={true}
          minHeight="min-h-[480px]"
        >
          <div className="w-full">
            <QuarterlyComparisonCard
              title="Student Challenges"
              subtitle="Involvement vs. Placement Success"
              data={quarterlyComparisonData}
              primaryLabel="Students Involved"
              secondaryLabel="Students Placed"
              summaryLabel="Conversion Rate"
              summaryValue="20.8%"
              enableAnimations={true}
              icon={<Target className="w-5 h-5" />}
            />
          </div>
        </VisualizationCard>
      </CategorySection>

      {/* Section 2: Data Charts */}
      <CategorySection
        icon={BarChart3}
        title="Data Charts"
        description="Full-size charts for detailed data analysis and reporting."
        columns={2}
      >
        <VisualizationCard
          title="Line Chart"
          description="Track trends over time with connected data points."
          useCases={['Trends', 'Time Series', 'Multi-year']}
          minHeight="min-h-[380px]"
        >
          <div className="w-full">
            <MetricsChart metrics={lineChartMetrics} variant="line" />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Area Chart"
          description="Filled area chart for cumulative or volume tracking."
          useCases={['Cumulative', 'Volume', 'Comparison']}
          minHeight="min-h-[380px]"
        >
          <div className="w-full">
            <MetricsChart metrics={[areaChartDataMetric]} variant="area" />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Bar Chart"
          description="Compare discrete categories or time periods."
          useCases={['Categories', 'Periods', 'Comparison']}
          minHeight="min-h-[380px]"
        >
          <div className="w-full">
            <MetricsChart metrics={barChartMetrics} variant="bar" />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Annual Progress"
          description="Year-over-year bar chart with optional target line."
          useCases={['Annual', 'Year-over-Year', 'Targets']}
          minHeight="min-h-[380px]"
        >
          <div className="w-full">
            <AnnualProgressChart
              data={annualProgressData}
              title="Teacher Satisfaction Score"
              description="Average score from annual staff survey"
              unit=""
            />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Goal Status Pie"
          description="Pie chart showing distribution of goals by status."
          useCases={['Status', 'Distribution', 'Overview']}
          minHeight="min-h-[380px]"
        >
          <div className="w-full">
            <GoalProgressChart goals={goalStatusData} variant="pie" />
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Likert Scale Chart"
          description="Survey rating visualization with average score display."
          useCases={['Surveys', 'Ratings', 'Satisfaction']}
          minHeight="min-h-[380px]"
        >
          <div className="w-full">
            <LikertScaleChart
              data={likertScaleData}
              title="Student Climate Survey"
              description="Average rating from annual student survey"
              scaleMin={1}
              scaleMax={5}
              scaleLabel="(5 high)"
              targetValue={4.0}
              showAverage={true}
            />
          </div>
        </VisualizationCard>
      </CategorySection>

      {/* Section 3: Simple Displays */}
      <CategorySection
        icon={Type}
        title="Simple Displays"
        description="Non-chart visualizations for values, text, and narrative content."
        columns={2}
      >
        <VisualizationCard
          title="Value Display"
          description="Simple large number or value with optional label."
          useCases={['Rating', 'Score', 'Single Value']}
          minHeight="min-h-[280px]"
        >
          <div className="w-full flex flex-col items-center justify-center py-8">
            <p className="text-sm text-slate-500 mb-2">
              {valueDisplayMetric.visualization_config?.title || valueDisplayMetric.metric_name}
            </p>
            <p className="text-6xl font-bold text-slate-900">
              {valueDisplayMetric.visualization_config?.displayValue || valueDisplayMetric.current_value}
            </p>
            <p className="text-lg text-slate-500 mt-2">{valueDisplayMetric.unit}</p>
            {valueDisplayMetric.target_value && (
              <p className="text-sm text-emerald-600 mt-3">
                Target: {valueDisplayMetric.target_value} {valueDisplayMetric.unit}
              </p>
            )}
          </div>
        </VisualizationCard>

        <VisualizationCard
          title="Narrative Display"
          description="Rich text content for qualitative updates and summaries."
          useCases={['Updates', 'Summaries', 'Qualitative']}
          minHeight="min-h-[280px]"
        >
          <div className="w-full bg-slate-50 rounded-lg p-6">
            {narrativeDisplayMetric.visualization_config?.showTitle && (
              <h4 className="font-semibold text-slate-900 mb-3">
                {narrativeDisplayMetric.visualization_config.title}
              </h4>
            )}
            <div
              className="prose prose-sm prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: narrativeDisplayMetric.visualization_config?.content || '',
              }}
            />
          </div>
        </VisualizationCard>
      </CategorySection>
    </div>
  );
}
