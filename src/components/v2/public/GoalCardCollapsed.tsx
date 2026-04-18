import type { Widget, WidgetConfig } from '../../../lib/types/v2';

const INDICATOR_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  red: { bg: '#fee2e2', text: '#dc2626', dot: '#dc2626' },
  green: { bg: '#dcfce7', text: '#16a34a', dot: '#16a34a' },
  amber: { bg: '#fef3c7', text: '#d97706', dot: '#d97706' },
  gray: { bg: '#f3f4f6', text: '#6b7280', dot: '#6b7280' },
};

function getTypeLabel(widgetType: string): string {
  switch (widgetType) {
    case 'bar-chart':
    case 'area-line':
      return 'CURRENT SCORE';
    case 'donut':
    case 'progress-bar':
      return 'COMPLETION';
    case 'big-number':
      return 'VALUE';
    default:
      return 'METRIC';
  }
}

function formatValue(config: WidgetConfig): string {
  const value = config.value;
  if (value === undefined || value === null) return '—';
  const unit = config.unit || '';
  if (unit === '%') return `${value}%`;
  if (unit) return `${value} ${unit}`;
  return String(value);
}

export interface GoalCardCollapsedProps {
  goalNumber: string;
  title: string;
  widgets?: Widget[];
  primaryColor?: string;
  onClick: () => void;
  subGoalCount?: number;
}

export function GoalCardCollapsed({
  goalNumber,
  title,
  widgets = [],
  primaryColor,
  onClick,
  subGoalCount,
}: GoalCardCollapsedProps) {
  const primaryWidget = widgets[0];
  const config = primaryWidget?.config;

  return (
    <button
      aria-label={`Goal ${goalNumber}: ${title}. Click to view details`}
      className="w-full text-left rounded-2xl p-5 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold"
          style={{
            border: `2px solid ${primaryColor || '#1e293b'}`,
            color: primaryColor || '#1e293b',
          }}
        >
          {goalNumber}
        </div>
        <div
          className="flex-1 text-sm font-semibold line-clamp-2 leading-snug"
          style={{ color: 'var(--editorial-text-primary)' }}
        >
          {title}
        </div>
      </div>

      {/* KPI section */}
      {primaryWidget ? (
        <div>
          {config.indicatorText && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2"
              style={{
                backgroundColor: INDICATOR_COLORS[config.indicatorColor || 'gray']?.bg,
                color: INDICATOR_COLORS[config.indicatorColor || 'gray']?.text,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: INDICATOR_COLORS[config.indicatorColor || 'gray']?.dot }}
              />
              {config.indicatorText}
            </span>
          )}
          <span
            className="text-[10px] font-semibold tracking-widest uppercase block mb-1"
            style={{ color: 'var(--editorial-text-muted)' }}
          >
            {getTypeLabel(primaryWidget.type)}
          </span>
          <span
            className="text-[28px] font-bold leading-none block"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            {formatValue(config)}
          </span>
          {config.target !== undefined && (
            <span
              className="text-[11px] block mt-1"
              style={{ color: 'var(--editorial-text-muted)' }}
            >
              Target: {config.target}{config.unit === '%' ? '%' : config.unit ? ` ${config.unit}` : ''}
            </span>
          )}
        </div>
      ) : (
        <span
          className="text-sm block"
          style={{ color: 'var(--editorial-text-muted)' }}
        >
          No metrics defined
        </span>
      )}

      {/* Footer */}
      <div
        className="mt-3 pt-3 flex items-center justify-between text-[11px]"
        style={{
          borderTop: '1px solid var(--editorial-border-light, #f0eee9)',
          color: 'var(--editorial-text-muted)',
        }}
      >
        {subGoalCount != null && subGoalCount > 0 ? (
          <span>{subGoalCount} sub-goal{subGoalCount !== 1 ? 's' : ''}</span>
        ) : (
          <span />
        )}
        <span style={{ color: 'var(--editorial-accent-link, #4a6fa5)' }}>
          View →
        </span>
      </div>
    </button>
  );
}
