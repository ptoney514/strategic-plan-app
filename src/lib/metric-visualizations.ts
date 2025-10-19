// Metric Visualization Types and Configurations
// Adapted from strategic-plan-builder for Vite app

import {
  BarChart3,
  PieChart,
  TrendingUp,
  Percent,
  Hash,
  Gauge,
  Activity,
  CheckCircle2,
  LineChart,
  SlidersHorizontal,
  FileText,
  type LucideIcon
} from 'lucide-react';

export type VisualizationType =
  | 'percentage'
  | 'number'
  | 'ratio'
  | 'bar-chart'
  | 'line-chart'
  | 'donut-chart'
  | 'gauge'
  | 'survey'
  | 'status'
  | 'likert-scale'
  | 'narrative';

export interface VisualizationOption {
  id: VisualizationType;
  name: string;
  description: string;
  icon: LucideIcon;
  preview: string;
  dataFields: string[];
  status: 'ready' | 'coming-soon'; // Indicates if the visualization is fully functional
}

export const visualizationOptions: VisualizationOption[] = [
  // Ready metrics - alphabetical order
  {
    id: 'likert-scale',
    name: 'Likert Scale',
    description: 'Track survey responses on rating scales (1-5, 1-7, etc.)',
    icon: SlidersHorizontal,
    preview: '/previews/likert-scale.svg',
    dataFields: ['scaleMin', 'scaleMax', 'dataPoints', 'scaleLabel', 'targetValue'],
    status: 'ready'
  },
  {
    id: 'narrative',
    name: 'Narrative/Rich Text',
    description: 'Rich text content with formatting, links, and structured information',
    icon: FileText,
    preview: '/previews/narrative.svg',
    dataFields: ['content', 'title', 'allowedTags'],
    status: 'ready'
  },
  {
    id: 'number',
    name: 'Number/KPI',
    description: 'Display a key number or metric with trend indicator',
    icon: Hash,
    preview: '/previews/number.svg',
    dataFields: ['currentValue', 'targetValue', 'unit', 'showTrend', 'previousValue'],
    status: 'ready'
  },
  {
    id: 'ratio',
    name: 'Ratio',
    description: 'Display a ratio value (e.g., 2.6:1) with descriptive text',
    icon: SlidersHorizontal,
    preview: '/previews/ratio.svg',
    dataFields: ['ratioValue', 'label', 'showTarget'],
    status: 'ready'
  },
  // Coming soon metrics - alphabetical order
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Compare values across categories or time periods',
    icon: BarChart3,
    preview: '/previews/bar-chart.svg',
    dataFields: ['dataPoints', 'xAxisLabel', 'yAxisLabel', 'showLegend'],
    status: 'coming-soon'
  },
  {
    id: 'donut-chart',
    name: 'Donut Chart',
    description: 'Display proportions and percentages of a whole',
    icon: PieChart,
    preview: '/previews/donut-chart.svg',
    dataFields: ['categories', 'centerLabel', 'showLegend', 'colors'],
    status: 'coming-soon'
  },
  {
    id: 'gauge',
    name: 'Gauge/Meter',
    description: 'Show performance against a scale or range',
    icon: Gauge,
    preview: '/previews/gauge.svg',
    dataFields: ['currentValue', 'minValue', 'maxValue', 'segments', 'unit'],
    status: 'coming-soon'
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Show trends and changes over time',
    icon: LineChart,
    preview: '/previews/line-chart.svg',
    dataFields: ['dataPoints', 'xAxisLabel', 'yAxisLabel', 'showArea'],
    status: 'coming-soon'
  },
  {
    id: 'percentage',
    name: 'Percentage',
    description: 'Show a percentage with optional target and progress bar',
    icon: Percent,
    preview: '/previews/percentage.svg',
    dataFields: ['currentValue', 'targetValue', 'label', 'showProgressBar'],
    status: 'coming-soon'
  },
  {
    id: 'status',
    name: 'Status Indicator',
    description: 'Simple status card with color coding',
    icon: CheckCircle2,
    preview: '/previews/status.svg',
    dataFields: ['status', 'label', 'description', 'lastUpdated'],
    status: 'coming-soon'
  },
  {
    id: 'survey',
    name: 'Survey Results',
    description: 'Display survey data with multiple sources and trends',
    icon: Activity,
    preview: '/previews/survey.svg',
    dataFields: ['surveyData', 'scale', 'sources', 'narrative'],
    status: 'coming-soon'
  }
];

// Configuration interfaces for each visualization type
export interface PercentageConfig {
  currentValue: number;
  targetValue?: number;
  label: string;
  showProgressBar?: boolean;
  showTrend?: boolean;
  suffix?: string;
}

export interface NumberConfig {
  currentValue: number;
  targetValue?: number;
  previousValue?: number;
  unit?: string;
  label: string;
  showTrend?: boolean;
  decimals?: number;
}

export interface RatioConfig {
  ratioValue: string; // e.g., "2.6:1" or "0.7:1"
  label: string; // e.g., "Risk Ratio for OSS/Expulsion - Black/African American Students is "
  targetValue?: string; // Optional target ratio
  showTarget?: boolean;
}

export interface BarChartConfig {
  dataPoints: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export interface LineChartConfig {
  dataPoints: Array<{
    x: string | number;
    y: number;
    series?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showArea?: boolean;
  showDots?: boolean;
  smoothCurve?: boolean;
}

export interface DonutChartConfig {
  categories: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
}

export interface GaugeConfig {
  currentValue: number;
  minValue: number;
  maxValue: number;
  segments?: Array<{
    min: number;
    max: number;
    color: string;
    label?: string;
  }>;
  unit?: string;
  label: string;
}

export interface SurveyConfig {
  surveyData: Array<{
    year: number;
    primaryValue?: number;
    dataValue?: number;
    surveyValue?: number;
  }>;
  scaleMin: number;
  scaleMax: number;
  sources?: string[];
  narrative?: string;
  label: string;
}

export interface StatusConfig {
  status: 'on-target' | 'off-target' | 'at-risk' | 'completed' | 'pending';
  label: string;
  description?: string;
  lastUpdated?: Date;
  showIcon?: boolean;
}

export interface LikertScaleConfig {
  scaleMin: number;
  scaleMax: number;
  scaleLabel?: string;
  dataPoints: Array<{
    label: string;
    value: number;
  }>;
  targetValue?: number;
  showTarget?: boolean;
  showAverage?: boolean;
}

export interface NarrativeConfig {
  content: string;           // HTML string with rich text
  title?: string;            // Optional section title
  allowedTags?: string[];    // Security: whitelist HTML tags (defaults to safe list)
  maxLength?: number;        // Character limit for content
  showTitle?: boolean;       // Show/hide the title
}

export type MetricVisualizationConfig =
  | { type: 'percentage'; config: PercentageConfig }
  | { type: 'number'; config: NumberConfig }
  | { type: 'ratio'; config: RatioConfig }
  | { type: 'bar-chart'; config: BarChartConfig }
  | { type: 'line-chart'; config: LineChartConfig }
  | { type: 'donut-chart'; config: DonutChartConfig }
  | { type: 'gauge'; config: GaugeConfig }
  | { type: 'survey'; config: SurveyConfig }
  | { type: 'status'; config: StatusConfig }
  | { type: 'likert-scale'; config: LikertScaleConfig }
  | { type: 'narrative'; config: NarrativeConfig };

// Helper to get default config for a visualization type
export function getDefaultConfig(type: VisualizationType): any {
  switch (type) {
    case 'percentage':
      return {
        currentValue: '',
        targetValue: 100,
        label: 'Metric Name',
        showProgressBar: true,
        showTrend: true
      };
    case 'number':
      return {
        currentValue: 0,
        label: 'Metric Name',
        showTrend: true,
        decimals: 0
      };
    case 'ratio':
      return {
        ratioValue: '1.0:1',
        label: 'Risk Ratio is ',
        showTarget: false
      };
    case 'bar-chart':
      return {
        dataPoints: [
          { label: '2023', value: 0 },
          { label: '2024', value: 0 },
          { label: '2025', value: 0 }
        ],
        yAxisLabel: 'Value',
        showLegend: false
      };
    case 'line-chart':
      return {
        dataPoints: [
          { x: 'Jan', y: 0 },
          { x: 'Feb', y: 0 },
          { x: 'Mar', y: 0 }
        ],
        showArea: false,
        showDots: true
      };
    case 'donut-chart':
      return {
        categories: [
          { name: 'Category 1', value: 30 },
          { name: 'Category 2', value: 40 },
          { name: 'Category 3', value: 30 }
        ],
        showLegend: true,
        showPercentages: true
      };
    case 'gauge':
      return {
        currentValue: 50,
        minValue: 0,
        maxValue: 100,
        label: 'Performance',
        segments: [
          { min: 0, max: 33, color: '#ef4444', label: 'Low' },
          { min: 33, max: 66, color: '#eab308', label: 'Medium' },
          { min: 66, max: 100, color: '#22c55e', label: 'High' }
        ]
      };
    case 'survey':
      return {
        surveyData: [],
        scaleMin: 1,
        scaleMax: 5,
        label: 'Survey Results'
      };
    case 'status':
      return {
        status: 'on-target',
        label: 'Status',
        showIcon: true
      };
    case 'likert-scale':
      return {
        scaleMin: 1,
        scaleMax: 5,
        scaleLabel: '(5 high)',
        dataPoints: [
          { label: '2023', value: 0 },
          { label: '2024', value: 0 },
          { label: '2025', value: 0 }
        ],
        targetValue: 4,
        showTarget: true,
        showAverage: true
      };
    case 'narrative':
      return {
        content: '<p>Enter your narrative content here...</p>',
        title: 'Narrative Title',
        showTitle: true,
        allowedTags: ['p', 'h1', 'h2', 'h3', 'a', 'ul', 'li', 'strong', 'em', 'u', 'br'],
        maxLength: 5000
      };
    default:
      return {};
  }
}
