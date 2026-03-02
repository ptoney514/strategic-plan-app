// V2 Types — Simplified strategic planning interfaces

export type WidgetType = 'donut' | 'big-number' | 'bar-chart' | 'area-line' | 'progress-bar' | 'pie-breakdown';

export type TemplateMode = 'hierarchical' | 'launch-traction';

export interface WidgetConfig {
  value?: number;
  target?: number;
  unit?: string;
  label?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'flat';
  dataPoints?: { label: string; value: number; color?: string }[];
  legend?: { label: string; color: string }[];
}

export interface Widget {
  id: string;
  organizationId: string;
  planId: string;
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
