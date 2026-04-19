'use client';

import { useCallback, type KeyboardEvent } from 'react';
import { StatusChip, type StatusValue } from './StatusChip';

export interface NestedSubGoalProps {
  badgeText: string;
  title: string;
  description?: string;
  currentValue: string;
  targetValue: string;
  currentUnit?: string;
  status: StatusValue;
  statusLabel?: string;
  onClick?: () => void;
}

export function NestedSubGoal({
  badgeText,
  title,
  description,
  currentValue,
  targetValue,
  currentUnit,
  status,
  statusLabel,
  onClick,
}: NestedSubGoalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && onClick) {
        event.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div className="flex items-stretch gap-1">
      <div className="nested-rail" aria-hidden="true" />
      <div
        className="subgoal-nested flex-1"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="num-badge-xs">{badgeText}</span>
            <div className="min-w-0 flex-1">
              <div
                className="text-[13px] font-semibold leading-tight"
                style={{ color: 'var(--ink)' }}
              >
                {title}
              </div>
              {description ? (
                <div
                  className="mt-0.5 text-[11px]"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[12px]">
            <div className="text-right">
              <div
                className="text-[13px] font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                {currentValue}
                <span
                  className="ml-1 text-[10px] font-normal"
                  style={{ color: 'var(--ink-3)' }}
                >
                  / {targetValue}
                </span>
              </div>
              {currentUnit ? (
                <div className="text-[10px]" style={{ color: 'var(--ink-3)' }}>
                  {currentUnit}
                </div>
              ) : null}
            </div>
            <StatusChip status={status} label={statusLabel} size="sm" />
            <svg
              className="caret"
              width="9"
              height="9"
              viewBox="0 0 10 10"
              fill="none"
              style={{ color: 'var(--ink-3)' }}
              aria-hidden="true"
            >
              <path
                d="M2 3.5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
