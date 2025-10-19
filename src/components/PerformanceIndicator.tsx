import {
  getProgressQualitativeLabel,
  getProgressColor,
  getProgressScoreOutOf5
} from '../lib/types';

interface PerformanceIndicatorProps {
  progress: number;
  displayMode?: 'percentage' | 'qualitative' | 'score' | 'color-only' | 'hidden' | 'custom';
  customValue?: string;
  showLabels?: boolean;
  onClick?: () => void;
}

export function PerformanceIndicator({
  progress,
  displayMode = 'qualitative',
  customValue,
  showLabels = true,
  onClick
}: PerformanceIndicatorProps) {
  if (displayMode === 'hidden') return null;

  const color = getProgressColor(progress);
  const qualitativeLabel = getProgressQualitativeLabel(progress);

  // Labels for the progress bar (Below, Good, Great, Excellent)
  const labels = [
    { label: 'Below', threshold: 0 },
    { label: 'Good', threshold: 41 },
    { label: 'Great', threshold: 71 },
    { label: 'Excellent', threshold: 91 }
  ];

  return (
    <div className="space-y-2">
      {/* Overall Progress Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-600">Overall Progress</span>
        {displayMode === 'percentage' && (
          <span
            className="text-sm font-bold"
            style={{ color }}
          >
            {Math.round(progress)}%
          </span>
        )}
        {displayMode === 'score' && (
          <span
            className="text-sm font-bold"
            style={{ color }}
          >
            {getProgressScoreOutOf5(progress)}/5.00
          </span>
        )}
        {displayMode === 'custom' && (
          <span
            className="text-sm font-bold"
            style={{ color }}
          >
            {customValue || `${Math.round(progress)}%`}
          </span>
        )}
      </div>

      {/* Labels above the bar for qualitative mode */}
      {displayMode === 'qualitative' && showLabels && (
        <div className="relative flex justify-between text-xs text-neutral-500 pb-1">
          {labels.map((item) => (
            <span
              key={item.label}
              className={progress >= item.threshold ? 'font-medium' : ''}
              style={{
                color: progress >= item.threshold ? color : undefined
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={`relative ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {/* Background track */}
        <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden shadow-inner relative">
          {/* Labels positioned along the bar - only show dividers for qualitative */}
          {displayMode === 'qualitative' && showLabels && labels.map((item, idx) => (
            <div
              key={item.label}
              className="absolute top-0 bottom-0 flex items-center"
              style={{
                left: `${item.threshold}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="h-full w-px bg-neutral-200" />
            </div>
          ))}

          {/* Progress fill */}
          <div
            className="h-full transition-all duration-700 ease-out relative"
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}40`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
          </div>
        </div>

        {/* Labels below the bar - only for non-qualitative modes */}
        {displayMode !== 'qualitative' && showLabels && (
          <div className="relative mt-1 flex justify-between text-xs text-neutral-500">
            {labels.map((item) => (
              <span
                key={item.label}
                className={progress >= item.threshold ? 'font-medium' : ''}
                style={{
                  color: progress >= item.threshold ? color : undefined
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Annual Progress - Clickable */}
      {onClick && (
        <button
          onClick={onClick}
          className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline transition-colors"
        >
          Annual progress
          <span className="ml-1">→</span>
        </button>
      )}
    </div>
  );
}
