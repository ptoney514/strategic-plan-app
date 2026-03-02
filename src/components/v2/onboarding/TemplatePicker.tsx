import { LayoutGrid, BarChart3, Rocket } from 'lucide-react';
import type { DashboardTemplate } from '../../../lib/types';

const TEMPLATES: {
  id: DashboardTemplate;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'hierarchical',
    name: 'Hierarchical',
    description: 'Nested goals and strategies in a tree view. Best for multi-level strategic plans.',
    icon: LayoutGrid,
  },
  {
    id: 'metrics-grid',
    name: 'Metrics Grid',
    description: 'Data-focused cards with charts and KPIs. Great for data-driven organizations.',
    icon: BarChart3,
  },
  {
    id: 'launch-traction',
    name: 'Launch Traction',
    description: 'Progress-focused timeline view. Perfect for new initiatives and startups.',
    icon: Rocket,
  },
];

interface TemplatePickerProps {
  selected: DashboardTemplate;
  onChange: (template: DashboardTemplate) => void;
}

export function TemplatePicker({ selected, onChange }: TemplatePickerProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Choose your dashboard template</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pick a layout for your public dashboard. You can change this later.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => {
          const isSelected = selected === template.id;
          const Icon = template.icon;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={`
                p-5 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3
                className={`text-sm font-semibold ${
                  isSelected ? 'text-blue-900' : 'text-gray-900'
                }`}
              >
                {template.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{template.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
