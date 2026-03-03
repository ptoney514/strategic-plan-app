import type { WidgetConfig } from '../../../../lib/types/v2';

interface ProgressBarWidgetProps {
  config: WidgetConfig;
  title: string;
  subtitle?: string;
}

export function ProgressBarWidget({ config }: ProgressBarWidgetProps) {
  const value = config.value ?? 0;
  const target = config.target ?? 100;
  const label = config.label ?? '';
  const progress = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="py-4 space-y-3">
      {label && (
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          {label}
        </span>
      )}
      <div className="flex items-center justify-between text-sm">
        <span
          className="font-semibold"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {value.toLocaleString()} / {target.toLocaleString()}
        </span>
        <span
          className="font-medium"
          style={{ color: 'var(--editorial-accent-primary, #6366f1)' }}
        >
          {progress.toFixed(0)}%
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--editorial-border, #e5e7eb)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--editorial-accent-primary, #6366f1)',
          }}
        />
      </div>
    </div>
  );
}
