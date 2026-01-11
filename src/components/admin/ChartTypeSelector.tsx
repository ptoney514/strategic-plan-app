import { BarChart3, LineChart, AreaChart, PieChart } from 'lucide-react';
import type { ChartType } from '../../lib/types';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (chartType: ChartType) => void;
}

const CHART_OPTIONS = [
  { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar' },
  { type: 'line' as ChartType, icon: LineChart, label: 'Line' },
  { type: 'area' as ChartType, icon: AreaChart, label: 'Area' },
  { type: 'donut' as ChartType, icon: PieChart, label: 'Donut' },
] as const;

/**
 * ChartTypeSelector - Visualization type picker
 *
 * Displays a grid of chart type options (bar, line, area, donut)
 * with icons and labels. Selected type is highlighted.
 */
export function ChartTypeSelector({ value, onChange }: ChartTypeSelectorProps) {
  return (
    <div className="mb-4 p-4 bg-white border border-[#e8e6e1] rounded-lg">
      <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3">
        Visualization Type
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {CHART_OPTIONS.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
              value === type
                ? 'border-[#10b981] bg-[#d1fae5] text-[#059669]'
                : 'border-[#e8e6e1] bg-white text-[#6a6a6a] hover:border-[#10b981] hover:bg-[#f0fdf4]'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
