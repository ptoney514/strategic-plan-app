'use client';

import {
  useCallback,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { StatusChip, type StatusValue } from './StatusChip';

export type AccordionGoalRowBadgeSize = 'md' | 'sm';

export interface AccordionGoalRowProps {
  id: string;
  badgeText: string;
  badgeSize?: AccordionGoalRowBadgeSize;
  title: string;
  description?: string;
  currentValue: string;
  targetValue: string;
  currentUnit?: string;
  status: StatusValue;
  statusLabel?: string;
  accentColor?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export function AccordionGoalRow({
  id,
  badgeText,
  badgeSize = 'md',
  title,
  description,
  currentValue,
  targetValue,
  currentUnit,
  status,
  statusLabel,
  accentColor,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
}: AccordionGoalRowProps) {
  const isControlled = typeof open === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolledOpen;
  const paneId = `${id}-pane`;
  const badgeClass = badgeSize === 'sm' ? 'num-badge-sm' : 'num-badge';

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [isOpen, isControlled, onOpenChange]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      toggle();
    },
    [toggle]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }
    },
    [toggle]
  );

  return (
    <>
      <div
        id={id}
        className={`subgoal-row${isOpen ? ' open' : ''}`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={paneId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className={badgeClass}>{badgeText}</span>
            <div className="min-w-0 flex-1">
              <div
                className="text-[16px] font-medium leading-tight"
                style={{ color: 'var(--ink)' }}
              >
                {title}
              </div>
              {description ? (
                <div
                  className="mt-0.5 text-[12px]"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5 text-[13px]">
            <div className="text-right">
              <div
                className="text-[15px] font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                {currentValue}
                <span
                  className="ml-1 text-[11px] font-normal"
                  style={{ color: 'var(--ink-3)' }}
                >
                  / {targetValue}
                </span>
              </div>
              {currentUnit ? (
                <div className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
                  {currentUnit}
                </div>
              ) : null}
            </div>
            <StatusChip status={status} label={statusLabel} />
            <svg
              className="caret"
              width="11"
              height="11"
              viewBox="0 0 10 10"
              fill="none"
              style={{ color: accentColor ?? 'var(--ink-3)' }}
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
      {isOpen ? (
        <div id={paneId} className="subgoal-expanded">
          {children}
        </div>
      ) : null}
    </>
  );
}
