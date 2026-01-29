import type { ReactNode } from 'react';

interface VisualizationCardProps {
  title: string;
  description: string;
  useCases: string[];
  children: ReactNode;
  minHeight?: string;
  wide?: boolean; // Spans 2 columns in grid layout
}

/**
 * VisualizationCard - Wrapper component for each visualization in the Visual Library
 *
 * Features:
 * - Fixed height card with white background
 * - Title, description, and use case badges
 * - Contains the actual chart/visual component
 * - Responsive padding and consistent styling
 */
export function VisualizationCard({
  title,
  description,
  useCases,
  children,
  minHeight = 'min-h-[320px]',
  wide = false,
}: VisualizationCardProps) {
  const wideClass = wide ? 'col-span-2' : '';

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 flex flex-col ${minHeight} ${wideClass}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {/* Use case badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {useCases.map((useCase) => (
          <span
            key={useCase}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
          >
            {useCase}
          </span>
        ))}
      </div>

      {/* Chart/Visual content */}
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
