// Dashboard Template Types
export type DashboardTemplate = 'hierarchical' | 'metrics-grid' | 'launch-traction';

export interface DashboardConfig {
  showSidebar?: boolean;
  showNarrativeHero?: boolean;
  gridColumns?: 2 | 3 | 4;
  enableAnimations?: boolean;
  cardVariant?: 'default' | 'compact' | 'rich';
}

export interface District {
  id: string;
  name: string;
  slug: string;
  entity_type?: string;
  entity_label?: string;
  tagline?: string;
  primary_color: string;
  secondary_color?: string;
  logo_url?: string;
  admin_email: string;
  is_public: boolean;
  is_active?: boolean;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Dashboard template configuration
  dashboard_template?: DashboardTemplate;
  dashboard_config?: DashboardConfig;
  // Computed fields (populated by service layer)
  goals_count?: number;
  metrics_count?: number;
  admins_count?: number;
  district_id?: string;
}

export interface DistrictWithSummary extends District {
  goalCount?: number;
  strategyCount?: number;
  subGoalCount?: number;
  metricCount?: number;
  lastActivity?: string;
}

export interface School {
  id: string;
  district_id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  description?: string;
  address?: string;
  phone?: string;
  principal_name?: string;
  principal_email?: string;
  is_public: boolean;
  student_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolWithSummary extends School {
  goalCount?: number;
  strategyCount?: number;
  subGoalCount?: number;
  metricCount?: number;
  lastActivity?: string;
}

export interface SchoolAdmin {
  id: string;
  user_id: string;
  school_id: string;
  school_slug: string;
  district_slug: string;
  created_at: string;
  created_by?: string;
}

export interface Plan {
  id: string;
  district_id: string | null;  // Nullable: plan belongs to either district OR school
  school_id?: string | null;    // Optional: plan belongs to either district OR school
  name: string;
  slug: string;
  type_label?: string;          // Free-form: "Strategic", "Functional", "Annual", etc.
  description?: string;
  is_public: boolean;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  order_position: number;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanWithSummary extends Plan {
  objectiveCount?: number;
  goalCount?: number;
  metricCount?: number;
  overallProgress?: number;
}

export interface Goal {
  id: string;
  district_id: string | null;  // Nullable: goal belongs to either district OR school
  school_id?: string | null;    // Optional: goal belongs to either district OR school
  plan_id?: string | null;      // Plan this objective belongs to (only for level 0 goals)
  parent_id: string | null;
  goal_number: string;
  title: string;
  description?: string;
  level: 0 | 1 | 2;
  order_position: number;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  owner_name?: string;
  department?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status_detail?: 'not_started' | 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  review_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  last_reviewed?: string;
  budget_allocated?: number;
  budget_spent?: number;
  strategic_theme_id?: string;
  is_public?: boolean;
  executive_summary?: string;
  indicator_text?: string;
  indicator_color?: string;
  image_url?: string;
  header_color?: string;
  color?: 'red' | 'blue' | 'amber' | 'green';  // Theme color for objective cards
  show_progress_bar?: boolean;
  children?: Goal[];
  metrics?: Metric[];

  // Overall progress tracking
  overall_progress?: number;
  overall_progress_override?: number;
  overall_progress_display_mode?: 'percentage' | 'qualitative' | 'score' | 'color-only' | 'hidden' | 'custom';
  overall_progress_custom_value?: string;
  overall_progress_source?: 'calculated' | 'manual';
  overall_progress_last_calculated?: string;
  overall_progress_override_by?: string;
  overall_progress_override_at?: string;
  overall_progress_override_reason?: string;

  // Calculated status fields (for StatusManager component)
  calculated_status?: 'on-target' | 'at-risk' | 'critical' | 'off-target' | 'not-started';
  status_calculation_confidence?: number;
}

export type MetricType = 'percent' | 'number' | 'rating' | 'currency' | 'status' | 'narrative' | 'link' | 'survey';
export type DataSourceType = 'manual' | 'survey' | 'map_data' | 'state_testing' | 'total_number' | 'percent' | 'narrative' | 'link';
export type ChartType = 'line' | 'bar' | 'donut' | 'area' | 'value' | 'narrative' | 'progress' | 'number' | 'gauge' | 'auto' | 'blog';
export type MetricStatus = 'on-target' | 'off-target' | 'critical' | 'no-data';
export type MetricCategory = 'enrollment' | 'achievement' | 'discipline' | 'attendance' | 'culture' | 'other';

export interface Metric {
  id: string;
  goal_id: string;
  district_id: string;
  metric_name: string;
  name?: string; // Legacy support
  description?: string;
  metric_type?: MetricType;
  metric_category?: MetricCategory;
  data_source?: DataSourceType;
  current_value?: number;
  actual_value?: number;
  target_value?: number;
  unit: string;
  timeframe_start?: number;
  timeframe_end?: number;
  data_points?: DataPoint[] | TimeSeriesDataPoint[];
  is_primary?: boolean;
  display_order?: number;
  chart_type?: ChartType;
  baseline_value?: number;
  milestone_dates?: MilestoneDate[];
  trend_direction?: 'improving' | 'stable' | 'declining';

  // Enhanced time-series fields
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  aggregation_method: 'average' | 'sum' | 'latest' | 'max' | 'min';
  decimal_places?: number;
  is_percentage?: boolean;
  is_higher_better?: boolean;
  ytd_value?: number;
  ytd_change?: number;
  eoy_projection?: number;
  last_actual_period?: string;

  // Metric calculation type (for overall progress)
  metric_calculation_type?: 'numeric' | 'ratio' | 'qualitative' | 'percentage' | 'count' | 'rollup';
  qualitative_mapping?: Record<string, number>;

  data_source_details?: string;
  last_collected?: string;
  risk_threshold_critical?: number;
  risk_threshold_warning?: number;
  calculation_method?: string;
  reporting_responsible?: string;
  is_cumulative?: boolean;
  display_width?: 'full' | 'half' | 'third';
  display_height?: 'small' | 'medium' | 'large';
  show_trend?: boolean;
  show_comparison?: boolean;
  comparison_period?: 'month' | 'quarter' | 'year';
  status?: MetricStatus;
  status_reason?: string;
  created_at?: string;
  updated_at?: string;

  // Custom badge fields (manual status indicator override)
  indicator_text?: string; // Custom badge text (e.g., "On Target", "Exceeding Goals")
  indicator_color?: string; // Custom badge color: green, amber, red, gray

  // Visualization fields (for custom metric visualizations)
  visualization_type?: string;
  visualization_config?: VisualizationConfig; // JSONB field containing chart-specific configuration
}

// Visualization configuration types
export interface VisualizationConfig {
  chartType?: ChartType | 'pie' | 'scatter' | 'likert';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showDataLabels?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  // For 'value' visualization type - displays just a value (number, text like "3.15", "758", "GREAT!")
  displayValue?: string;
  // For 'narrative' visualization type - rich text HTML content
  content?: string;
  title?: string;
  showTitle?: boolean;
  // Donut chart style options
  donutStyle?: 'classic' | 'achievement';
  donutAccentColor?: string;
  donutCenterLabel?: string;
  donutIcon?: string; // icon name from lucide-react
  [key: string]: unknown; // Allow additional properties for extensibility
}

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  description?: string; // Optional description for legend display
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  target?: number;
  label?: string;
}

export interface MilestoneDate {
  date: string;
  label: string;
  target?: number;
}

export type PeriodType = 'annual' | 'quarterly' | 'monthly';

export interface MetricTimeSeries {
  id: string;
  metric_id: string;
  district_id: string;
  period: string; // '2024', '2024-Q1', '2024-01'
  period_type: PeriodType;
  target_value?: number;
  actual_value?: number;
  status?: MetricStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MetricWithTimeSeries extends Metric {
  timeSeries?: MetricTimeSeries[];
}

export interface HierarchicalGoal extends Goal {
  children: HierarchicalGoal[];
}

export function buildGoalHierarchy(goals: Goal[]): HierarchicalGoal[] {
  const goalMap = new Map<string, HierarchicalGoal>();
  const rootGoals: HierarchicalGoal[] = [];

  goals.forEach(goal => {
    goalMap.set(goal.id, { ...goal, children: [] });
  });

  goals.forEach(goal => {
    const hierarchicalGoal = goalMap.get(goal.id)!;
    if (!goal.parent_id) {
      rootGoals.push(hierarchicalGoal);
    } else {
      const parent = goalMap.get(goal.parent_id);
      if (parent) {
        parent.children.push(hierarchicalGoal);
      } else {
        rootGoals.push(hierarchicalGoal);
      }
    }
  });

  const sortGoals = (goals: HierarchicalGoal[]) => {
    goals.sort((a, b) => {
      const aParts = a.goal_number.split('.').map(Number);
      const bParts = b.goal_number.split('.').map(Number);
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) {
          return aPart - bPart;
        }
      }
      return 0;
    });

    goals.forEach(goal => {
      if (goal.children && goal.children.length > 0) {
        sortGoals(goal.children);
      }
    });
  };

  sortGoals(rootGoals);
  return rootGoals;
}

export function getNextGoalNumber(
  goals: Goal[],
  parentId: string | null,
  level: 0 | 1 | 2
): string {
  const siblingGoals = goals.filter(
    g => g.parent_id === parentId && g.level === level
  );

  if (siblingGoals.length === 0) {
    if (!parentId || level === 0) {
      return '1';
    }
    const parent = goals.find(g => g.id === parentId);
    if (parent) {
      return `${parent.goal_number}.1`;
    }
    return '1';
  }

  const numbers = siblingGoals
    .map(g => {
      const parts = g.goal_number.split('.');
      return parseInt(parts[parts.length - 1], 10);
    })
    .filter(n => !isNaN(n));

  const maxNumber = Math.max(...numbers, 0);
  
  if (!parentId || level === 0) {
    return String(maxNumber + 1);
  }
  
  const parent = goals.find(g => g.id === parentId);
  if (parent) {
    return `${parent.goal_number}.${maxNumber + 1}`;
  }
  
  return String(maxNumber + 1);
}

export function calculateGoalProgress(goal: Goal): number {
  if (!goal.metrics || goal.metrics.length === 0) {
    return 0;
  }

  const validMetrics = goal.metrics.filter(m => 
    m.current_value !== undefined && 
    m.current_value !== null && 
    m.target_value !== undefined && 
    m.target_value !== null &&
    m.target_value !== 0
  );

  if (validMetrics.length === 0) {
    return 0;
  }

  const progressSum = validMetrics.reduce((sum, metric) => {
    const progress = (metric.current_value! / metric.target_value!) * 100;
    return sum + Math.min(progress, 100);
  }, 0);

  return Math.round(progressSum / validMetrics.length);
}

export function getGoalStatus(goal: Goal): 'on-track' | 'at-risk' | 'critical' | 'completed' {
  const progress = calculateGoalProgress(goal);

  if (goal.status_detail === 'completed' || progress >= 100) {
    return 'completed';
  }

  if (progress >= 70) {
    return 'on-track';
  }

  if (progress >= 40) {
    return 'at-risk';
  }

  return 'critical';
}

// ============================================================================
// OVERALL PROGRESS CALCULATION (For Strategic Objectives)
// ============================================================================

/**
 * Calculates overall progress for a goal by aggregating metrics and child goals
 * Handles:
 * - Ratio metrics where lower is better (e.g., risk ratios)
 * - "Rollup" type metrics (excluded from calculation)
 * - Hierarchical aggregation (recursive for child goals)
 * - Manual overrides (takes precedence)
 */
export function calculateOverallProgress(
  goal: Goal,
  allGoals: Goal[],
  allMetrics: Metric[]
): number | null {
  // Manual override takes precedence
  if (goal.overall_progress_override != null) {
    return goal.overall_progress_override;
  }

  // Find metrics for this goal (exclude "rollup" type)
  const goalMetrics = allMetrics.filter(m =>
    m.goal_id === goal.id &&
    m.metric_calculation_type !== 'rollup'
  );

  // Find children of this goal
  const children = allGoals.filter(g => g.parent_id === goal.id);

  let metricProgress: number | null = null;
  let childProgress: number | null = null;

  // Calculate metric average (with direction awareness)
  if (goalMetrics.length > 0) {
    const validMetrics = goalMetrics.filter(m =>
      m.current_value != null &&
      m.target_value != null &&
      m.target_value !== 0
    );

    if (validMetrics.length > 0) {
      const progressSum = validMetrics.reduce((sum, m) => {
        let progress: number;

        // Handle ratio metrics where LOWER is better (e.g., risk ratios)
        if (m.is_higher_better === false && m.baseline_value != null) {
          const improvement = m.baseline_value - m.current_value!;
          const targetImprovement = m.baseline_value - m.target_value!;
          progress = targetImprovement !== 0
            ? Math.min((improvement / targetImprovement) * 100, 100)
            : 0;
        } else {
          // Normal calculation (HIGHER is better)
          progress = Math.min((m.current_value! / m.target_value!) * 100, 100);
        }

        return sum + Math.max(0, progress); // Ensure non-negative
      }, 0);

      metricProgress = progressSum / validMetrics.length;
    }
  }

  // Calculate children average (RECURSIVE)
  if (children.length > 0) {
    const childProgressValues = children
      .map(child => calculateOverallProgress(child, allGoals, allMetrics))
      .filter(p => p != null) as number[];

    if (childProgressValues.length > 0) {
      childProgress = childProgressValues.reduce((sum, p) => sum + p, 0) / childProgressValues.length;
    }
  }

  // Combine (simple average, no weighting per requirement)
  if (metricProgress != null && childProgress != null) {
    return (metricProgress + childProgress) / 2;
  } else if (metricProgress != null) {
    return metricProgress;
  } else if (childProgress != null) {
    return childProgress;
  }

  return null; // No data available
}

/**
 * Converts numeric progress (0-100) to qualitative label
 */
export function getProgressQualitativeLabel(progress: number): string {
  if (progress >= 91) return 'Excellent';
  if (progress >= 71) return 'Great';
  if (progress >= 41) return 'Good';
  if (progress > 0) return 'Below';
  return 'No Data';
}

/**
 * Converts numeric progress (0-100) to score out of 5
 */
export function getProgressScoreOutOf5(progress: number): string {
  return ((progress / 100) * 5).toFixed(2);
}

/**
 * Gets color for progress bar based on progress level
 */
export function getProgressColor(progress: number): string {
  if (progress >= 91) return '#10b981'; // green
  if (progress >= 71) return '#84cc16'; // lime
  if (progress >= 41) return '#f59e0b'; // amber
  if (progress > 0) return '#ef4444';  // red
  return '#6b7280'; // gray (no data)
}