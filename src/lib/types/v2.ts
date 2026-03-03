// V2 Types — Simplified strategic planning interfaces

export type WidgetType = 'donut' | 'big-number' | 'bar-chart' | 'area-line' | 'progress-bar' | 'pie-breakdown';

export type TemplateMode = 'hierarchical' | 'launch-traction';

export interface WidgetDataPoint {
  label: string;
  value?: number;
  values?: number[];
  color?: string;
}

export interface WidgetConfig {
  value?: number;
  target?: number;
  baseline?: number;
  unit?: string;
  label?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  isHigherBetter?: boolean;
  indicatorText?: string;
  indicatorColor?: 'red' | 'green' | 'amber' | 'gray';
  dataPoints?: WidgetDataPoint[];
  legend?: string[];
  breakdownItems?: { label: string; value: number; color: string }[];
  colors?: string[];
}

export interface CreateWidgetPayload {
  type: WidgetType;
  title: string;
  subtitle?: string;
  config?: WidgetConfig;
  plan_id?: string;
  position?: number;
}

export interface UpdateWidgetPayload {
  title?: string;
  subtitle?: string;
  type?: WidgetType;
  config?: WidgetConfig;
  plan_id?: string;
  position?: number;
  is_active?: boolean;
}

export interface ReorderWidgetPayload {
  orgSlug: string;
  widgets: { id: string; position: number }[];
}

export interface Widget {
  id: string;
  organizationId: string;
  planId: string;
  goalId?: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  config: WidgetConfig;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface V2Goal {
  id: string;
  organizationId: string;
  planId: string;
  parentId: string | null;
  goalNumber: string;
  title: string;
  description?: string;
  level: 0 | 1 | 2;
  orderPosition: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  ownerId?: string;
  ownerName?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  children?: V2Goal[];
}

export interface OnboardingState {
  step: number;
  orgName: string;
  slug: string;
  templateMode: TemplateMode;
  colors: {
    primary: string;
    secondary: string;
  };
  logoUrl?: string;
}
