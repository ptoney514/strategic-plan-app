import type { DashboardTemplate } from '../../../lib/types';

interface TemplateModeSelectorProps {
  selected: DashboardTemplate;
  onChange: (template: DashboardTemplate) => void;
}

const templates: { value: DashboardTemplate; label: string; description: string }[] = [
  { value: 'hierarchical', label: 'Hierarchical', description: 'Display goals in a tree structure' },
  { value: 'launch-traction', label: 'Launch Traction', description: 'Widget-based dashboard grid' },
];

export function TemplateModeSelector({ selected, onChange }: TemplateModeSelectorProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Dashboard template">
      {templates.map((t) => {
        const isSelected = selected === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(t.value)}
            className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="font-medium text-slate-900">{t.label}</div>
            <div className="text-sm text-slate-500 mt-0.5">{t.description}</div>
          </button>
        );
      })}
    </div>
  );
}
