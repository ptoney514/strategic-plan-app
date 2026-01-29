import { Check, LayoutGrid, LayoutList, Sparkles } from 'lucide-react';
import type { DashboardTemplate } from '../../lib/types';
import { getAllTemplates } from '../public/templates/TemplateRegistry';

interface TemplateSelectorProps {
  value: DashboardTemplate;
  onChange: (template: DashboardTemplate) => void;
  disabled?: boolean;
}

const TEMPLATE_ICONS: Record<DashboardTemplate, React.ReactNode> = {
  hierarchical: <LayoutList className="h-6 w-6" />,
  'metrics-grid': <LayoutGrid className="h-6 w-6" />,
  'launch-traction': <Sparkles className="h-6 w-6" />,
};

const TEMPLATE_PREVIEWS: Record<DashboardTemplate, string> = {
  hierarchical: 'Traditional strategic plan layout with sidebar navigation, objectives grid, and nested goals.',
  'metrics-grid': 'Flat grid of KPI cards with optional sidebar. Great for simple metric dashboards.',
  'launch-traction': 'Animated dashboard with counters, donut charts, and trend indicators. Full-width layout.',
};

/**
 * TemplateSelector - Visual picker for dashboard templates
 */
export function TemplateSelector({
  value,
  onChange,
  disabled = false,
}: TemplateSelectorProps) {
  const templates = getAllTemplates();

  return (
    <div data-testid="template-selector" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const isSelected = value === template.id;

        return (
          <button
            key={template.id}
            type="button"
            data-testid={`template-option-${template.id}`}
            onClick={() => onChange(template.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all
              ${isSelected
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center mb-3
              ${isSelected
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }
            `}>
              {TEMPLATE_ICONS[template.id]}
            </div>

            {/* Title */}
            <h3 className={`
              font-semibold mb-1
              ${isSelected
                ? 'text-amber-900 dark:text-amber-100'
                : 'text-slate-900 dark:text-slate-100'
              }
            `}>
              {template.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {TEMPLATE_PREVIEWS[template.id]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
