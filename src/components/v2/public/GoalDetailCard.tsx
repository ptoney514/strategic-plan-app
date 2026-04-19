import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Goal } from '../../../lib/types';
import type { Widget, WidgetConfig } from '../../../lib/types/v2';
import { GoalStatusBadge } from './GoalStatusBadge';
import { BarChartWidget } from '../widgets/renderers/BarChartWidget';
import { AreaLineWidget } from '../widgets/renderers/AreaLineWidget';
import { DonutWidget } from '../widgets/renderers/DonutWidget';
import { BigNumberWidget } from '../widgets/renderers/BigNumberWidget';
import { ProgressBarWidget } from '../widgets/renderers/ProgressBarWidget';
import { PieBreakdownWidget } from '../widgets/renderers/PieBreakdownWidget';

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

function WidgetChart({ widget }: { widget: Widget }) {
  const { type, config, title, subtitle } = widget;
  switch (type) {
    case 'bar-chart':
      return <BarChartWidget config={config} title={title} subtitle={subtitle} />;
    case 'area-line':
      return <AreaLineWidget config={config} title={title} subtitle={subtitle} />;
    case 'donut':
      return <DonutWidget config={config} title={title} subtitle={subtitle} />;
    case 'big-number':
      return <BigNumberWidget config={config} title={title} subtitle={subtitle} />;
    case 'progress-bar':
      return <ProgressBarWidget config={config} title={title} subtitle={subtitle} />;
    case 'pie-breakdown':
      return <PieBreakdownWidget config={config} title={title} subtitle={subtitle} />;
    default:
      return null;
  }
}

export interface GoalDetailCardProps {
  goal: Goal;
  widgets?: Widget[];
  subGoalWidgets?: Record<string, Widget[]>;
  primaryColor?: string;
  onBack: () => void;
  buildLink?: (path: string) => string;
}

export function GoalDetailCard({
  goal,
  widgets = [],
  subGoalWidgets = {},
  primaryColor = '#1e293b',
  onBack: _onBack,
  buildLink = (p) => p,
}: GoalDetailCardProps) {
  const children = goal.children ?? [];
  const primaryWidget = widgets[0];
  const config = primaryWidget?.config;
  const hasWidgets = primaryWidget != null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
    >
      {/* Zone 1: Header */}
      <div
        className="flex items-start gap-3.5 p-6 max-sm:p-4"
        style={{ borderBottom: '1px solid var(--editorial-border-light, #f0eee9)' }}
      >
        <div
          className="w-9 h-9 rounded-lg text-white flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {goal.goal_number}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[17px] font-semibold"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            {goal.title}
          </div>
          {goal.description && (
            <p
              className="text-[13px] mt-1"
              style={{ color: 'var(--editorial-text-secondary)' }}
            >
              {goal.description}
            </p>
          )}
        </div>
        <GoalStatusBadge status={goal.status} className="shrink-0 ml-2 !text-[10px] !px-2.5 !py-0.5" />
      </div>

      {/* Zone 2: KPI + Chart */}
      {hasWidgets && (
        <div className="flex max-sm:flex-col" style={{ minHeight: 180 }}>
          {/* KPI Panel */}
          <div
            className="flex flex-col justify-center p-6 max-sm:p-4 sm:w-[280px] sm:shrink-0"
            style={{ borderRight: '1px solid var(--editorial-border-light, #f0eee9)' }}
          >
            {config!.indicatorText && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 self-start"
                style={{
                  backgroundColor: INDICATOR_COLORS[config!.indicatorColor || 'gray']?.bg,
                  color: INDICATOR_COLORS[config!.indicatorColor || 'gray']?.text,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: INDICATOR_COLORS[config!.indicatorColor || 'gray']?.dot }}
                />
                {config!.indicatorText}
              </span>
            )}
            <div
              className="text-[10px] font-semibold tracking-widest uppercase mb-1"
              style={{ color: 'var(--editorial-text-muted)' }}
            >
              {getTypeLabel(primaryWidget!.type)}
            </div>
            {(() => {
              const kpiText = formatValue(config!);
              return (
                <div
                  className={`${kpiText.length > 5 ? 'text-[28px]' : 'text-[44px]'} font-bold leading-none`}
                  style={{ color: 'var(--editorial-text-primary)' }}
                >
                  {kpiText}
                </div>
              );
            })()}
            <div className="mt-3 flex flex-col gap-1">
              {config!.target !== undefined && (
                <div className="text-[13px]" style={{ color: 'var(--editorial-text-secondary)' }}>
                  Target: <strong>{config!.target}{config!.unit === '%' ? '%' : config!.unit ? ` ${config!.unit}` : ''}</strong>
                </div>
              )}
              {config!.baseline !== undefined && (
                <div className="text-[13px]" style={{ color: 'var(--editorial-text-secondary)' }}>
                  Baseline: {config!.baseline}{config!.unit === '%' ? '%' : config!.unit ? ` ${config!.unit}` : ''}
                </div>
              )}
              {config!.value !== undefined && config!.baseline !== undefined && (() => {
                const delta = config!.value! - config!.baseline!;
                const isPositive = delta >= 0;
                return (
                  <div className="text-[13px] font-medium" style={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
                    {isPositive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}{config!.unit === '%' ? '%' : ''} from baseline
                  </div>
                );
              })()}
              {goal.owner_name && (
                <div
                  className="text-[11px] mt-1"
                  style={{ color: 'var(--editorial-text-muted)' }}
                >
                  {goal.owner_name}
                </div>
              )}
            </div>
          </div>

          {/* Chart Panel */}
          <div className="flex-1 p-6 max-sm:p-4 flex items-center justify-center">
            <div className={`w-full ${['donut', 'big-number', 'progress-bar'].includes(primaryWidget!.type) ? 'max-w-[300px]' : ''} min-h-[140px] sm:min-h-[180px]`}>
              <WidgetChart widget={primaryWidget!} />
            </div>
          </div>
        </div>
      )}

      {/* Zone 3: Source Annotation */}
      {primaryWidget?.updatedAt && (
        <div
          className="flex justify-end px-6 pb-3 max-sm:px-4 text-[11px]"
          style={{ color: 'var(--editorial-text-muted)' }}
        >
          Updated {new Date(primaryWidget.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}

      {/* Zone 4: Sub-goals */}
      {children.length > 0 && (
        <div
          className="p-5 max-sm:p-4"
          style={{ borderTop: '1px solid var(--editorial-border-light, #f0eee9)' }}
        >
          <div
            className="text-[10px] font-semibold tracking-widest uppercase mb-3"
            style={{ color: 'var(--editorial-text-muted)' }}
          >
            Sub-goals ({children.length})
          </div>
          <div className="flex flex-col gap-1">
            {children.map((child) => {
              const childWidgetList = subGoalWidgets[child.id] || [];
              const previewWidget = childWidgetList[0];
              return (
                <Link
                  key={child.id}
                  href={buildLink(`/goals/${child.id}`)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl transition-colors"
                  style={{ color: 'var(--editorial-text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt, #f5f3ef)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {child.goal_number}
                  </div>
                  <div className="flex-1 min-w-0 text-[13px] font-medium truncate">
                    {child.title}
                  </div>
                  {previewWidget && (
                    <span
                      className="text-xs font-semibold shrink-0"
                      style={{ color: 'var(--editorial-text-muted)' }}
                    >
                      {formatValue(previewWidget.config)}
                    </span>
                  )}
                  <ChevronRight
                    className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--editorial-text-muted)' }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasWidgets && children.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--editorial-text-muted)' }}>
            No metrics defined
          </p>
        </div>
      )}
    </div>
  );
}
