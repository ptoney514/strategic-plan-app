import { Settings2 } from 'lucide-react';
import type { DashboardTemplate, DashboardConfig } from '../../lib/types';
import { getTemplateInfo } from '../public/templates/TemplateRegistry';

interface TemplateConfigEditorProps {
  template: DashboardTemplate;
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
  disabled?: boolean;
}

/**
 * TemplateConfigEditor - Template-specific configuration options
 */
export function TemplateConfigEditor({
  template,
  config,
  onChange,
  disabled = false,
}: TemplateConfigEditorProps) {
  const templateInfo = getTemplateInfo(template);
  const mergedConfig = { ...templateInfo.defaultConfig, ...config };

  const updateConfig = (key: keyof DashboardConfig, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div data-testid="template-config" className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="h-5 w-5 text-slate-400" />
        <h4 className="font-medium text-slate-900 dark:text-slate-100">
          Template Options
        </h4>
      </div>

      {/* Show Sidebar Toggle */}
      <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Show Sidebar
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Display navigation sidebar with objectives
          </p>
        </div>
        <input
          type="checkbox"
          data-testid="config-show-sidebar"
          checked={mergedConfig.showSidebar ?? true}
          onChange={(e) => updateConfig('showSidebar', e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
      </label>

      {/* Show Narrative Hero Toggle */}
      <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Show Hero Section
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Display title and description at top of dashboard
          </p>
        </div>
        <input
          type="checkbox"
          data-testid="config-show-hero"
          checked={mergedConfig.showNarrativeHero ?? true}
          onChange={(e) => updateConfig('showNarrativeHero', e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
      </label>

      {/* Enable Animations Toggle */}
      <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Enable Animations
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Animate cards and charts on load
          </p>
        </div>
        <input
          type="checkbox"
          data-testid="config-enable-animations"
          checked={mergedConfig.enableAnimations ?? false}
          onChange={(e) => updateConfig('enableAnimations', e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
      </label>

      {/* Grid Columns Selector */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className="mb-3">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Grid Columns
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Number of columns on large screens
          </p>
        </div>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((cols) => (
            <button
              key={cols}
              type="button"
              data-testid={`config-grid-${cols}`}
              onClick={() => updateConfig('gridColumns', cols)}
              disabled={disabled}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors
                ${mergedConfig.gridColumns === cols
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {cols} Columns
            </button>
          ))}
        </div>
      </div>

      {/* Card Variant Selector */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <div className="mb-3">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Card Style
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visual style for metric cards
          </p>
        </div>
        <div className="flex gap-2">
          {(['default', 'compact', 'rich'] as const).map((variant) => (
            <button
              key={variant}
              type="button"
              data-testid={`config-card-${variant}`}
              onClick={() => updateConfig('cardVariant', variant)}
              disabled={disabled}
              className={`
                flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors capitalize
                ${mergedConfig.cardVariant === variant
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
