import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface CategorySectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  columns?: 2 | 3;
  children: ReactNode;
}

/**
 * CategorySection - Groups visualizations by category in the Visual Library
 *
 * Features:
 * - Section header with icon and title
 * - Optional description
 * - 2 or 3 column responsive grid of VisualizationCard components
 */
export function CategorySection({
  icon: Icon,
  title,
  description,
  columns = 3,
  children,
}: CategorySectionProps) {
  const gridCols = columns === 2
    ? 'grid-cols-1 lg:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-slate-100 rounded-lg">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Grid of cards */}
      <div className={`grid ${gridCols} gap-6`}>
        {children}
      </div>
    </section>
  );
}
