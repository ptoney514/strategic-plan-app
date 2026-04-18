import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Widget } from '../../../lib/types/v2';
import { WidgetRenderer } from './WidgetRenderer';

interface WidgetCardProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (widget: Widget) => void;
}

const TYPE_LABELS: Record<string, string> = {
  donut: 'Donut',
  'big-number': 'Big Number',
  'bar-chart': 'Bar Chart',
  'area-line': 'Area Line',
  'progress-bar': 'Progress Bar',
  'pie-breakdown': 'Pie Breakdown',
};

export function WidgetCard({ widget, onEdit, onDelete }: WidgetCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-testid={`widget-card-${widget.id}`}
      className="rounded-xl p-5 relative group"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            {widget.title}
          </h3>
          {widget.subtitle && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--editorial-text-secondary)' }}
            >
              {widget.subtitle}
            </p>
          )}
        </div>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 shrink-0"
          style={{
            backgroundColor: 'var(--editorial-bg, #f9fafb)',
            color: 'var(--editorial-text-secondary)',
          }}
        >
          {TYPE_LABELS[widget.type] ?? widget.type}
        </span>
      </div>

      {/* Renderer */}
      <WidgetRenderer widget={widget} />

      {/* Hover actions */}
      {hovered && (onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(widget)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
              }}
              aria-label="Edit widget"
            >
              <Pencil className="h-3.5 w-3.5" style={{ color: 'var(--editorial-text-secondary)' }} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(widget)}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
              }}
              aria-label="Delete widget"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
