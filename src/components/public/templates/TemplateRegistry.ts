import type { DashboardTemplate, DashboardConfig } from '../../../lib/types';

/**
 * Template metadata for registry
 */
export interface TemplateInfo {
  id: DashboardTemplate;
  name: string;
  description: string;
  defaultConfig: DashboardConfig;
  previewImage?: string;
}

/**
 * Registry of available dashboard templates
 */
export const TEMPLATE_REGISTRY: Record<DashboardTemplate, TemplateInfo> = {
  hierarchical: {
    id: 'hierarchical',
    name: 'Hierarchical',
    description: 'Traditional strategic plan view with objectives, goals, and metrics in a tree structure',
    defaultConfig: {
      showSidebar: true,
      showNarrativeHero: true,
      gridColumns: 3,
      enableAnimations: false,
      cardVariant: 'default',
    },
  },
  'metrics-grid': {
    id: 'metrics-grid',
    name: 'Metrics Grid',
    description: 'Flat grid of KPI cards with optional sidebar navigation',
    defaultConfig: {
      showSidebar: true,
      showNarrativeHero: true,
      gridColumns: 3,
      enableAnimations: true,
      cardVariant: 'compact',
    },
  },
  'launch-traction': {
    id: 'launch-traction',
    name: 'Launch Traction',
    description: 'Animated dashboard with counters, donut charts, and trend indicators for tracking outcomes',
    defaultConfig: {
      showSidebar: false,
      showNarrativeHero: false,
      gridColumns: 4,
      enableAnimations: true,
      cardVariant: 'rich',
    },
  },
};

/**
 * Get template info by ID
 */
export function getTemplateInfo(templateId: DashboardTemplate): TemplateInfo {
  return TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY.hierarchical;
}

/**
 * Get merged config (defaults + custom overrides)
 */
export function getMergedConfig(
  templateId: DashboardTemplate,
  customConfig?: DashboardConfig
): DashboardConfig {
  const templateInfo = getTemplateInfo(templateId);
  return {
    ...templateInfo.defaultConfig,
    ...customConfig,
  };
}

/**
 * Get all available templates as array
 */
export function getAllTemplates(): TemplateInfo[] {
  return Object.values(TEMPLATE_REGISTRY);
}
