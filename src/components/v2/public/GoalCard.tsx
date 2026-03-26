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

export interface GoalCardProps {
  goalNumber: string;
  title: string;
  description?: string;
  status?: string;
  widgets?: Widget[];
  primaryColor?: string;
  isExpanded: boolean;
  onClick: () => void;
  subGoalCount?: number;
}

export function GoalCard({
  goalNumber,
  title,
  widgets = [],
  primaryColor,
  isExpanded,
  onClick,
  subGoalCount,
}: GoalCardProps) {
  const primaryWidget = widgets[0];
  const config = primaryWidget?.config;

  return (
    <button
      aria-expanded={isExpanded}
      aria-label={`Goal ${goalNumber}: ${title}. ${isExpanded ? 'Expanded' : 'Click to expand'}`}
      className="w-full text-left rounded-xl p-5 cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            border: `2px solid ${primaryColor || '#1e293b'}`,
            color: primaryColor || '#1e293b',
          }}
        >
          {goalNumber}
        </div>
        <div
          className="flex-1 text-sm font-semibold line-clamp-3 leading-snug pt-2"
          style={{ color: 'var(--editorial-text-primary)', minHeight: '3.75rem' }}
        >
          {title}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--editorial-border)' }} className="mt-4 pt-3">
        {/* Bottom section */}
        <div className="flex items-end justify-between">
          <div>
            {primaryWidget ? (
              <>
                {/* Indicator badge */}
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
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  {getTypeLabel(primaryWidget.type)}
                </span>
                <span
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--editorial-text-primary)' }}
                >
                  {formatValue(config)}
                </span>
                {config.target !== undefined && (
                  <span
                    className="text-xs block mt-0.5"
                    style={{ color: 'var(--editorial-text-secondary)' }}
                  >
                    Target: {config.target}{config.unit === '%' ? '%' : config.unit ? ` ${config.unit}` : ''}
                  </span>
                )}
              </>
            ) : (
              <span
                className="text-sm text-center block"
                style={{ color: 'var(--editorial-text-secondary)' }}
              >
                No metrics defined
              </span>
            )}
          </div>
          {subGoalCount != null && subGoalCount > 0 && (
            <span className="text-[10px] font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>
              {subGoalCount} sub-goal{subGoalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
