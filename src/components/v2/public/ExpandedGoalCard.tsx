import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minimize2, ChevronRight } from 'lucide-react';
import type { Goal } from '../../../lib/types';
import type { Widget, WidgetConfig } from '../../../lib/types/v2';
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

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  critical: { bg: '#fee2e2', text: '#991b1b' },
  high: { bg: '#fef3c7', text: '#92400e' },
  medium: { bg: '#dbeafe', text: '#1e40af' },
  low: { bg: '#f3f4f6', text: '#374151' },
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

export interface ExpandedGoalCardProps {
  goal: Goal;
  widgets?: Widget[];
  subGoalWidgets?: Record<string, Widget[]>;
  primaryColor?: string;
  onClose: () => void;
}

export function ExpandedGoalCard({ goal, widgets = [], subGoalWidgets = {}, primaryColor = '#1e293b', onClose }: ExpandedGoalCardProps) {
  const children = goal.children ?? [];
  const primaryWidget = widgets[0];
  const config = primaryWidget?.config;
  const hasWidgets = primaryWidget != null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '2px solid var(--editorial-border)',
      }}
      className="rounded-xl shadow-lg overflow-hidden relative"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Collapse goal details"
        className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-10"
        style={{ color: 'var(--editorial-text-secondary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--editorial-border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Minimize2 className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 p-6 pb-0">
        <div
          className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: primaryColor }}
        >
          {goal.goal_number}
        </div>
        <div className="flex-1 pr-10">
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p
              className="text-sm mt-2"
              style={{ color: 'var(--editorial-text-secondary)' }}
            >
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        {hasWidgets && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Widget metric details */}
            <div className="space-y-3">
              {/* Indicator badge */}
              {config!.indicatorText && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
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
              <p
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: 'var(--editorial-text-secondary)' }}
              >
                {getTypeLabel(primaryWidget!.type)}
              </p>
              <p
                className="text-4xl font-semibold"
                style={{ color: 'var(--editorial-text-primary)' }}
              >
                {formatValue(config!)}
              </p>
              {config!.target !== undefined && (
                <p
                  className="text-sm"
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  Target: {config!.target}{config!.unit === '%' ? '%' : config!.unit ? ` ${config!.unit}` : ''}
                </p>
              )}
              {config!.baseline !== undefined && (
                <p
                  className="text-sm"
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  Baseline: {config!.baseline}{config!.unit === '%' ? '%' : config!.unit ? ` ${config!.unit}` : ''}
                </p>
              )}
              {goal.owner_name && (
                <p
                  className="text-sm"
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  {goal.owner_name}
                </p>
              )}
              {goal.priority && PRIORITY_STYLES[goal.priority] && (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: PRIORITY_STYLES[goal.priority].bg,
                    color: PRIORITY_STYLES[goal.priority].text,
                  }}
                >
                  {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                </span>
              )}
            </div>

            {/* Right column: Widget chart */}
            <div>
              <WidgetChart widget={primaryWidget!} />
            </div>
          </div>
        )}

        {/* Sub-Goals Section — always shown when children exist */}
        {children.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--editorial-border)' }}>
            <h4 className="text-xs font-medium tracking-wider uppercase mb-3"
                style={{ color: 'var(--editorial-text-secondary)' }}>
              Sub-Goals ({children.length})
            </h4>
            <div className="space-y-2">
              {children.map((child) => {
                const childWidgetList = subGoalWidgets[child.id] || [];
                const previewWidget = childWidgetList[0];
                return (
                  <Link
                    key={child.id}
                    to={`/goals/${child.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--editorial-surface-alt, var(--editorial-border))' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0"
                         style={{ backgroundColor: primaryColor }}>
                      {child.goal_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--editorial-text-primary)' }}>
                        {child.title}
                      </p>
                      {child.description && (
                        <p className="text-xs truncate" style={{ color: 'var(--editorial-text-secondary)' }}>
                          {child.description}
                        </p>
                      )}
                    </div>
                    {previewWidget && (
                      <span
                        className="text-xs font-semibold whitespace-nowrap shrink-0"
                        style={{ color: 'var(--editorial-text-secondary)' }}
                      >
                        {formatValue(previewWidget.config)} · {getTypeLabel(previewWidget.type)}
                      </span>
                    )}
                    <ChevronRight
                      className="w-4 h-4 shrink-0"
                      style={{ color: 'var(--editorial-text-secondary)' }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state: no widgets and no children */}
        {!hasWidgets && children.length === 0 && (
          <div className="text-center py-8">
            <p
              className="text-sm"
              style={{ color: 'var(--editorial-text-secondary)' }}
            >
              No metrics defined
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
