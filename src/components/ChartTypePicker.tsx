import React from 'react';
import { BarChart3, LineChart, AreaChart as AreaChartIcon, TrendingUp } from 'lucide-react';
import type { ChartType } from '../lib/types';

interface ChartTypePickerProps {
  value: ChartType | undefined;
  onChange: (type: ChartType) => void;
  disabled?: boolean;
}

export function ChartTypePicker({ value, onChange, disabled = false }: ChartTypePickerProps) {
  const chartTypes: Array<{
    type: ChartType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      type: 'bar',
      label: 'Bar Chart',
      description: 'Compare values across categories or time periods',
      icon: <BarChart3 className="h-8 w-8" />
    },
    {
      type: 'line',
      label: 'Line Chart',
      description: 'Show trends and changes over time',
      icon: <LineChart className="h-8 w-8" />
    },
    {
      type: 'area',
      label: 'Area Chart',
      description: 'Visualize cumulative values over time',
      icon: <AreaChartIcon className="h-8 w-8" />
    },
    {
      type: 'donut',
      label: 'Donut Chart',
      description: 'Show proportions and percentages',
      icon: <TrendingUp className="h-8 w-8" />
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Visualization Type
      </label>

      <div className="grid grid-cols-2 gap-3">
        {chartTypes.map((chart) => (
          <button
            key={chart.type}
            type="button"
            onClick={() => onChange(chart.type)}
            disabled={disabled}
            className={`
              relative p-4 border-2 rounded-lg text-left transition-all
              ${value === chart.type
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Selection Indicator */}
            {value === chart.type && (
              <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className={`mb-3 ${value === chart.type ? 'text-primary' : 'text-muted-foreground'}`}>
              {chart.icon}
            </div>

            {/* Label */}
            <div className="font-medium text-sm text-foreground mb-1">
              {chart.label}
            </div>

            {/* Description */}
            <div className="text-xs text-muted-foreground">
              {chart.description}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Choose how you want to visualize this measure's data. You can change this later.
      </p>
    </div>
  );
}
