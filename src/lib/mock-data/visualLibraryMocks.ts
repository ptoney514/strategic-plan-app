import type { Metric, Goal, TimeSeriesDataPoint, DataPoint } from '../types';

/**
 * Mock data utilities for the Visual Library page.
 * These provide sample data for demonstrating various chart and visualization types.
 */

// Helper to generate unique IDs
const generateId = () => `mock-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Creates time series data points for yearly tracking
 */
export function createYearlyTimeSeries(
  years: number[] = [2020, 2021, 2022, 2023, 2024],
  baseValue: number = 50,
  trend: 'increasing' | 'decreasing' | 'fluctuating' = 'increasing',
  targetValue?: number
): TimeSeriesDataPoint[] {
  return years.map((year, index) => {
    let value: number;
    const progress = index / (years.length - 1);

    switch (trend) {
      case 'increasing':
        value = baseValue + (baseValue * 0.5 * progress) + (Math.random() * 5 - 2.5);
        break;
      case 'decreasing':
        value = baseValue - (baseValue * 0.3 * progress) + (Math.random() * 5 - 2.5);
        break;
      case 'fluctuating':
        value = baseValue + (Math.sin(index * 1.5) * 15) + (Math.random() * 5 - 2.5);
        break;
    }

    return {
      date: `${year}-01-01`,
      value: Math.round(value * 100) / 100,
      target: targetValue,
    };
  });
}

/**
 * Creates time series data points for quarterly tracking
 */
export function createQuarterlyTimeSeries(
  startYear: number = 2024,
  quarters: number = 4,
  baseValue: number = 100,
  targetValue?: number
): TimeSeriesDataPoint[] {
  const points: TimeSeriesDataPoint[] = [];

  for (let q = 0; q < quarters; q++) {
    const quarterNum = (q % 4) + 1;
    const year = startYear + Math.floor(q / 4);
    points.push({
      date: `${year}-${String(quarterNum * 3).padStart(2, '0')}-01`,
      value: Math.round((baseValue + q * 8 + Math.random() * 10) * 100) / 100,
      target: targetValue,
      label: `Q${quarterNum} ${year}`,
    });
  }

  return points;
}

/**
 * Creates monthly time series data
 */
export function createMonthlyTimeSeries(
  months: number = 6,
  baseValue: number = 50,
  targetValue?: number
): TimeSeriesDataPoint[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const points: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < months; i++) {
    points.push({
      date: `2024-${String(i + 1).padStart(2, '0')}-01`,
      value: Math.round((baseValue + i * 5 + Math.random() * 8) * 100) / 100,
      target: targetValue,
      label: monthNames[i],
    });
  }

  return points;
}

/**
 * Creates data points for categorical data (pie charts, etc.)
 */
export function createCategoricalData(categories: { label: string; value: number; color?: string }[]): DataPoint[] {
  return categories.map(cat => ({
    label: cat.label,
    value: cat.value,
    color: cat.color,
  }));
}

// ============================================================================
// DASHBOARD CARD MOCK METRICS
// ============================================================================

export const animatedCounterMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Total Student Enrollment',
  description: 'Total students enrolled in the district',
  current_value: 8547,
  target_value: 9000,
  unit: 'students',
  frequency: 'yearly',
  aggregation_method: 'latest',
  trend_direction: 'improving',
  ytd_change: 3.2,
  is_higher_better: true,
};

export const donutProgressMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Budget Utilization',
  description: 'Percentage of allocated budget spent',
  current_value: 78,
  target_value: 100,
  unit: '%',
  frequency: 'quarterly',
  aggregation_method: 'latest',
  is_percentage: true,
  is_higher_better: true,
};

export const donutAchievementMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Teacher Training Hours',
  description: 'Professional development hours completed this year',
  current_value: 758,
  target_value: 1000,
  unit: 'hours',
  frequency: 'yearly',
  aggregation_method: 'sum',
  is_higher_better: true,
  visualization_config: {
    donutStyle: 'achievement',
    donutCenterLabel: 'EARNED TO DATE',
    donutIcon: 'Award',
  },
};

export const trendIndicatorMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Average Daily Attendance',
  description: 'Average attendance rate across all schools',
  current_value: 94.5,
  target_value: 96,
  unit: '%',
  frequency: 'daily',
  aggregation_method: 'average',
  is_percentage: true,
  ytd_change: 1.8,
  is_higher_better: true,
  data_points: createMonthlyTimeSeries(6, 92, 96),
};

export const areaChartMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Reading Proficiency',
  description: 'Percentage of students at or above grade level',
  current_value: 72,
  target_value: 85,
  unit: '%',
  frequency: 'yearly',
  aggregation_method: 'average',
  is_percentage: true,
  is_higher_better: true,
  data_points: createMonthlyTimeSeries(6, 65, 85),
};

export const groupedBarMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Math Achievement',
  description: 'Students meeting math standards by quarter',
  current_value: 68,
  target_value: 80,
  unit: '%',
  frequency: 'quarterly',
  aggregation_method: 'average',
  is_percentage: true,
  is_higher_better: true,
  data_points: createQuarterlyTimeSeries(2024, 4, 60, 80),
};

// ============================================================================
// DATA CHARTS MOCK METRICS
// ============================================================================

export const lineChartMetrics: Metric[] = [
  {
    id: generateId(),
    goal_id: generateId(),
    district_id: generateId(),
    metric_name: 'Graduation Rate',
    current_value: 89,
    target_value: 95,
    baseline_value: 82,
    unit: '%',
    frequency: 'yearly',
    aggregation_method: 'average',
    is_percentage: true,
    is_higher_better: true,
    data_points: createYearlyTimeSeries([2020, 2021, 2022, 2023, 2024], 82, 'increasing', 95),
  },
];

export const areaChartDataMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Cumulative Professional Development Hours',
  description: 'Total PD hours completed by staff',
  current_value: 4500,
  target_value: 5000,
  unit: 'hours',
  frequency: 'monthly',
  aggregation_method: 'sum',
  is_higher_better: true,
  data_points: createMonthlyTimeSeries(6, 500, 850),
};

export const barChartMetrics: Metric[] = [
  {
    id: generateId(),
    goal_id: generateId(),
    district_id: generateId(),
    metric_name: 'Science Assessment Scores',
    current_value: 75,
    target_value: 85,
    unit: '%',
    frequency: 'yearly',
    aggregation_method: 'average',
    is_percentage: true,
    is_higher_better: true,
    data_points: createYearlyTimeSeries([2020, 2021, 2022, 2023, 2024], 68, 'increasing'),
  },
];

export const annualProgressData = [
  { year: '2020', value: 3.15, target: 4.0 },
  { year: '2021', value: 3.28, target: 4.0 },
  { year: '2022', value: 3.42, target: 4.0 },
  { year: '2023', value: 3.55, target: 4.0 },
  { year: '2024', value: 3.71, target: 4.0 },
];

// ============================================================================
// GOAL STATUS DATA (for pie chart)
// ============================================================================

export const goalStatusData: Goal[] = [
  {
    id: generateId(),
    district_id: generateId(),
    parent_id: null,
    goal_number: '1',
    title: 'Improve Reading Outcomes',
    level: 0,
    order_position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status_detail: 'in_progress',
    metrics: [
      {
        id: generateId(),
        goal_id: '',
        district_id: '',
        metric_name: 'Reading',
        current_value: 85,
        target_value: 100,
        unit: '%',
        frequency: 'yearly',
        aggregation_method: 'average'
      },
    ],
  },
  {
    id: generateId(),
    district_id: generateId(),
    parent_id: null,
    goal_number: '2',
    title: 'Enhance STEM Programs',
    level: 0,
    order_position: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status_detail: 'in_progress',
    metrics: [
      {
        id: generateId(),
        goal_id: '',
        district_id: '',
        metric_name: 'STEM',
        current_value: 72,
        target_value: 100,
        unit: '%',
        frequency: 'yearly',
        aggregation_method: 'average'
      },
    ],
  },
  {
    id: generateId(),
    district_id: generateId(),
    parent_id: null,
    goal_number: '3',
    title: 'Increase Parent Engagement',
    level: 0,
    order_position: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status_detail: 'in_progress',
    metrics: [
      {
        id: generateId(),
        goal_id: '',
        district_id: '',
        metric_name: 'Engagement',
        current_value: 45,
        target_value: 100,
        unit: '%',
        frequency: 'yearly',
        aggregation_method: 'average'
      },
    ],
  },
  {
    id: generateId(),
    district_id: generateId(),
    parent_id: null,
    goal_number: '4',
    title: 'Reduce Chronic Absenteeism',
    level: 0,
    order_position: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status_detail: 'completed',
    metrics: [
      {
        id: generateId(),
        goal_id: '',
        district_id: '',
        metric_name: 'Absenteeism',
        current_value: 100,
        target_value: 100,
        unit: '%',
        frequency: 'yearly',
        aggregation_method: 'average'
      },
    ],
  },
  {
    id: generateId(),
    district_id: generateId(),
    parent_id: null,
    goal_number: '5',
    title: 'Expand Special Education Services',
    level: 0,
    order_position: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status_detail: 'in_progress',
    metrics: [
      {
        id: generateId(),
        goal_id: '',
        district_id: '',
        metric_name: 'SPED',
        current_value: 35,
        target_value: 100,
        unit: '%',
        frequency: 'yearly',
        aggregation_method: 'average'
      },
    ],
  },
];

// ============================================================================
// LIKERT SCALE DATA
// ============================================================================

export const likertScaleData = [
  { year: '2020', value: 3.15 },
  { year: '2021', value: 3.28 },
  { year: '2022', value: 3.45 },
  { year: '2023', value: 3.62 },
  { year: '2024', value: 3.78 },
];

// ============================================================================
// SIMPLE DISPLAY MOCK METRICS
// ============================================================================

export const valueDisplayMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'District Rating',
  description: 'State performance rating',
  current_value: 3.85,
  target_value: 4.0,
  unit: 'out of 5',
  frequency: 'yearly',
  aggregation_method: 'latest',
  chart_type: 'value',
  visualization_config: {
    displayValue: '3.85',
    title: 'District Performance Rating',
  },
};

export const narrativeDisplayMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'Strategic Update',
  description: 'Quarterly narrative update on strategic progress',
  unit: '',
  frequency: 'quarterly',
  aggregation_method: 'latest',
  chart_type: 'narrative',
  visualization_config: {
    content: `<p><strong>Q4 2024 Highlights:</strong></p>
<ul>
<li>Graduation rate increased to 89%, exceeding target</li>
<li>New STEM lab completed at 3 middle schools</li>
<li>Teacher retention improved by 5 percentage points</li>
<li>Parent engagement scores at all-time high</li>
</ul>
<p><em>On track to meet all Year 3 strategic objectives.</em></p>`,
    title: 'Strategic Progress Update',
    showTitle: true,
  },
};

// ============================================================================
// CATEGORY BREAKDOWN MOCK METRIC
// ============================================================================

export const categoryBreakdownMetric: Metric = {
  id: generateId(),
  goal_id: generateId(),
  district_id: generateId(),
  metric_name: 'College Exposure',
  description: 'Student participation in college visit opportunities',
  current_value: 130, // Total (sum of categories)
  unit: 'visits',
  frequency: 'yearly',
  aggregation_method: 'sum',
  is_higher_better: true,
  data_points: [
    { label: 'In-Person Visits', value: 85, color: '#c85a42', description: 'Campus tours & reps' },
    { label: 'Virtual Visits', value: 45, color: '#1e293b', description: 'Online sessions & webinars' },
  ],
};

// ============================================================================
// QUARTERLY COMPARISON DATA
// ============================================================================

export const quarterlyComparisonData = [
  { quarter: 'Q1', primary: 120, secondary: 15 },
  { quarter: 'Q2', primary: 175, secondary: 35 },
  { quarter: 'Q3', primary: 230, secondary: 50 },
  { quarter: 'Q4', primary: 295, secondary: 60 },
];

// ============================================================================
// PROGRESS COUNTER CARD DATA
// ============================================================================

export const progressCounterData = {
  title: 'Parent Impact',
  subtitle: 'Total Attendance',
  value: 480,
  trendPercent: 12,
  trendLabel: 'this month',
  progressPercent: 75,
  progressLabel: 'of Annual Capacity reached',
};

// ============================================================================
// UTILITY FUNCTION TO GET ALL MOCKS
// ============================================================================

export function getAllMockMetrics(): Metric[] {
  return [
    animatedCounterMetric,
    donutProgressMetric,
    donutAchievementMetric,
    trendIndicatorMetric,
    areaChartMetric,
    groupedBarMetric,
    ...lineChartMetrics,
    areaChartDataMetric,
    ...barChartMetrics,
    valueDisplayMetric,
    narrativeDisplayMetric,
    categoryBreakdownMetric,
  ];
}
