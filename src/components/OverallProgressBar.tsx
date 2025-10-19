import React from 'react';
import type { Goal } from '../lib/types';
import {
  getProgressQualitativeLabel,
  getProgressScoreOutOf5,
  getProgressColor
} from '../lib/types';

interface OverallProgressBarProps {
  goal: Goal;
  showLabel?: boolean;
  onClick?: () => void;
  isAdmin?: boolean;
}

export function OverallProgressBar({
  goal,
  showLabel = true,
  onClick,
  isAdmin = false
}: OverallProgressBarProps) {
  // Determine which progress value to use (override takes precedence)
  const progress = goal.overall_progress_override ?? goal.overall_progress ?? 0;
  const displayMode = goal.overall_progress_display_mode || 'percentage';
  const isManual = goal.overall_progress_source === 'manual';

  // Get color based on progress level
  const progressColor = getProgressColor(progress);

  // Don't render if mode is 'hidden'
  if (displayMode === 'hidden') {
    return null;
  }

  // Render different display based on mode
  const renderProgressLabel = () => {
    switch (displayMode) {
      case 'percentage':
        return `${Math.round(progress)}%`;
      case 'qualitative':
        return getProgressQualitativeLabel(progress);
      case 'score':
        return `${getProgressScoreOutOf5(progress)}/5.00`;
      case 'color-only':
        return null; // No label for color-only mode
      case 'custom':
        return goal.overall_progress_custom_value || `${Math.round(progress)}%`; // Fallback to percentage if no custom value
      default:
        return `${Math.round(progress)}%`;
    }
  };

  const label = renderProgressLabel();

  // Tooltip content showing breakdown
  const tooltipContent = `
Overall Progress: ${Math.round(progress)}%
${isManual ? '(Manual Override)' : '(Auto-calculated)'}
${goal.overall_progress_override_reason ? `\nReason: ${goal.overall_progress_override_reason}` : ''}
  `.trim();

  // Labels for qualitative display (Below, Good, Great, Excellent)
  const qualitativeLabels = [
    { label: 'Below', threshold: 0 },
    { label: 'Good', threshold: 41 },
    { label: 'Great', threshold: 71 },
    { label: 'Excellent', threshold: 91 }
  ];

  return (
    <div
      className={`${isAdmin && onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={tooltipContent}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="space-y-2">
        {/* Labels above the bar for qualitative mode */}
        {displayMode === 'qualitative' && showLabel && (
          <div className="relative flex justify-between text-xs text-neutral-500 pb-1">
            {qualitativeLabels.map((item) => (
              <span
                key={item.label}
                className={progress >= item.threshold ? 'font-medium' : ''}
                style={{
                  color: progress >= item.threshold ? progressColor : undefined
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar Container with enhanced styling */}
        <div className="flex items-center gap-3 group">
          <div className="flex-1">
            <div className="relative">
              {/* Background track with shadow */}
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner relative">
                {/* Divider lines for qualitative mode */}
                {displayMode === 'qualitative' && showLabel && qualitativeLabels.map((item) => (
                  <div
                    key={item.label}
                    className="absolute top-0 bottom-0 flex items-center"
                    style={{
                      left: `${item.threshold}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="h-full w-px bg-neutral-300" />
                  </div>
                ))}

                {/* Progress fill with gradient and animation */}
                <div
                  className="h-full transition-all duration-700 ease-out relative"
                  style={{
                    width: `${Math.min(Math.max(progress, 0), 100)}%`,
                    background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                    boxShadow: `0 0 8px ${progressColor}40`
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
                </div>
              </div>

              {/* Hover overlay */}
              {isAdmin && onClick && (
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/30 transition-all duration-200" />
              )}
            </div>
          </div>

          {/* Label with enhanced typography - only show for non-qualitative modes */}
          {displayMode !== 'qualitative' && showLabel && label && (
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold whitespace-nowrap transition-all duration-200 group-hover:scale-105"
                style={{
                  color: progressColor,
                  textShadow: `0 1px 2px ${progressColor}20`
                }}
              >
                {label}
              </span>
              {isManual && (
                <span
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full"
                  title="Manually overridden by admin"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Manual
                </span>
              )}
            </div>
          )}

          {/* Admin Edit Button with enhanced styling */}
          {isAdmin && onClick && (
            <button
              className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 transform group-hover:scale-110"
              aria-label="Edit progress override"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
