import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { WidgetConfig } from '../../../../lib/types/v2';

interface BigNumberWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

export function BigNumberWidget({ config }: BigNumberWidgetProps) {
  const value = config.value ?? 0;
  const unit = config.unit ?? '';
  const trend = config.trend ?? '';
  const direction = config.trendDirection ?? 'flat';

  const trendColor =
    direction === 'up'
      ? 'text-green-600'
      : direction === 'down'
        ? 'text-red-600'
        : 'text-gray-500';

  const TrendIcon =
    direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="flex items-baseline gap-1">
        <span
          className="text-5xl font-bold"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {value.toLocaleString()}
        </span>
        {unit && (
          <span
            className="text-lg font-medium"
            style={{ color: 'var(--editorial-text-secondary)' }}
          >
            {unit}
          </span>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
