import { LayoutGrid } from 'lucide-react';
import type { Widget } from '../../../lib/types/v2';
import { WidgetCard } from './WidgetCard';

interface WidgetGridProps {
  widgets: Widget[];
  isLoading?: boolean;
  onEdit?: (widget: Widget) => void;
  onDelete?: (widget: Widget) => void;
  variant?: 'default' | 'public-detail';
}

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5 animate-pulse"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
    >
      <div className="h-4 w-2/3 rounded" style={{ backgroundColor: 'var(--editorial-border)' }} />
      <div className="h-3 w-1/3 rounded mt-2" style={{ backgroundColor: 'var(--editorial-border)' }} />
      <div className="h-32 w-full rounded mt-4" style={{ backgroundColor: 'var(--editorial-border)' }} />
    </div>
  );
}

export function WidgetGrid({
  widgets,
  isLoading,
  onEdit,
  onDelete,
  variant = 'default',
}: WidgetGridProps) {
  const gridClasses = variant === 'public-detail'
    ? 'grid grid-cols-1 gap-6 xl:grid-cols-2'
    : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

  if (isLoading) {
    return (
      <div className={gridClasses} data-widget-grid-variant={variant}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{
          backgroundColor: 'var(--editorial-surface)',
          border: '1px solid var(--editorial-border)',
        }}
      >
        <LayoutGrid
          className="h-10 w-10 mx-auto mb-3"
          style={{ color: 'var(--editorial-text-secondary)' }}
        />
        <p className="font-medium mb-1" style={{ color: 'var(--editorial-text-primary)' }}>
          No widgets yet
        </p>
        <p className="text-sm" style={{ color: 'var(--editorial-text-secondary)' }}>
          Add widgets to visualize your strategic plan data.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClasses} data-widget-grid-variant={variant}>
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
