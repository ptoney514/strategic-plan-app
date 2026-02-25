import type { ComponentType } from 'react';
import type { DashboardTemplate, DashboardConfig } from '../../../../../lib/types';
import { HierarchicalRenderer } from './HierarchicalRenderer';
import { MetricsGridRenderer } from './MetricsGridRenderer';
import { LaunchTractionRenderer } from './LaunchTractionRenderer';

export interface PreviewRendererProps {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  districtName: string;
  tagline?: string;
  config: DashboardConfig;
}

export const RENDERER_REGISTRY: Record<DashboardTemplate, ComponentType<PreviewRendererProps>> = {
  hierarchical: HierarchicalRenderer,
  'metrics-grid': MetricsGridRenderer,
  'launch-traction': LaunchTractionRenderer,
};
