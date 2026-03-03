import { X, PieChart, Hash, BarChart3, TrendingUp, Percent, CircleDot } from 'lucide-react';
import type { WidgetType } from '../../../lib/types/v2';

interface WidgetCatalogProps {
  onSelect: (type: WidgetType) => void;
  onClose: () => void;
}

const WIDGET_TYPES: { type: WidgetType; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; name: string; description: string }[] = [
  { type: 'donut', icon: PieChart, name: 'Donut Chart', description: 'Show progress toward a target as a donut chart' },
  { type: 'big-number', icon: Hash, name: 'Big Number', description: 'Display a key metric prominently with trend' },
  { type: 'bar-chart', icon: BarChart3, name: 'Bar Chart', description: 'Compare values across categories' },
  { type: 'area-line', icon: TrendingUp, name: 'Area Line', description: 'Track trends over time' },
  { type: 'progress-bar', icon: Percent, name: 'Progress Bar', description: 'Show completion toward a goal' },
  { type: 'pie-breakdown', icon: CircleDot, name: 'Pie Breakdown', description: 'Show distribution of values' },
];

export function WidgetCatalog({ onSelect, onClose }: WidgetCatalogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl"
        style={{
          backgroundColor: 'var(--editorial-surface, #fff)',
          border: '1px solid var(--editorial-border)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            Choose a Widget Type
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" style={{ color: 'var(--editorial-text-secondary)' }} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {WIDGET_TYPES.map(({ type, icon: Icon, name, description }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="rounded-xl p-4 text-left transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--editorial-bg, #f9fafb)',
                border: '1px solid var(--editorial-border)',
              }}
            >
              <div
                className="p-2 rounded-lg inline-block mb-3"
                style={{ backgroundColor: 'var(--editorial-surface)' }}
              >
                <Icon className="h-5 w-5" style={{ color: 'var(--editorial-accent-primary, #6366f1)' }} />
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: 'var(--editorial-text-primary)' }}
              >
                {name}
              </div>
              <div
                className="text-xs mt-1"
                style={{ color: 'var(--editorial-text-secondary)' }}
              >
                {description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
