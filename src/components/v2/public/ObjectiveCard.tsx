import { Target, ArrowRight } from 'lucide-react';

export interface ObjectiveCardProps {
  goalNumber: string;
  title: string;
  childCount: number;
  status?: string;
  primaryColor?: string;
  description?: string;
  overallProgress?: number;
  progressDisplayMode?: string;
  onClick?: () => void;
}

export function ObjectiveCard({
  goalNumber,
  title,
  childCount,
  primaryColor = '#1e293b',
  description,
  overallProgress,
  progressDisplayMode,
  onClick,
}: ObjectiveCardProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }

  const showProgress =
    progressDisplayMode !== 'hidden' &&
    overallProgress !== undefined &&
    overallProgress > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="group rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
      style={{
        backgroundColor: 'var(--editorial-surface)',
        border: '1px solid var(--editorial-border)',
      }}
    >
      {/* Header: Icon + Status Badge */}
      <div className="flex justify-between items-start w-full mb-4">
        <div
          className="w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0"
          style={{
            borderColor: 'var(--editorial-border)',
            backgroundColor: 'var(--editorial-surface)',
            color: 'var(--editorial-text-secondary)',
          }}
        >
          <Target className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title with number prefix */}
      <h3
        className="text-base font-semibold tracking-tight mb-2"
        style={{ color: 'var(--editorial-text-primary)' }}
      >
        <span
          className="font-medium mr-2"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          {goalNumber}.
        </span>
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-4 line-clamp-3"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        {description || 'Strategic objective for organizational growth and excellence.'}
      </p>

      {/* Progress bar */}
      {showProgress && (
        <div
          className="w-full h-1.5 rounded-full mb-4 overflow-hidden"
          style={{ backgroundColor: 'var(--editorial-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(overallProgress!, 100)}%`,
              backgroundColor: primaryColor,
            }}
          />
        </div>
      )}

      {/* Footer: child count + View details */}
      <div
        className="mt-auto flex items-center justify-between text-xs font-medium pt-2"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        <span>{childCount} {childCount === 1 ? 'goal' : 'goals'}</span>
        <span className="flex items-center">
          View details
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );
}
