'use client'
import Link from 'next/link';
import { MaterialIcon } from './MaterialIcon';

export interface SubGoalItem {
  id: string;
  goalNumber?: string;
  title: string;
  description?: string;
  href: string;
  target?: number;
  current?: number;
  unit?: string;
  status?: string;
  valuePreview?: string;
  childCount?: number;
}

export interface SubGoalAccordionProps {
  subGoals: SubGoalItem[];
}

function statusLabel(status?: string): { label: string; color: string } {
  switch (status?.toLowerCase().replace(/\s+/g, '_')) {
    case 'completed':
    case 'on_target':
    case 'exceeding':
      return { label: 'Completed', color: 'text-md3-secondary' };
    case 'in_progress':
    case 'at_risk':
      return { label: 'In Progress', color: 'text-md3-tertiary' };
    case 'off_track':
    case 'critical':
      return { label: 'Off Track', color: 'text-md3-error' };
    default:
      return { label: 'Not Started', color: 'text-slate-500' };
  }
}

export function SubGoalAccordion({ subGoals }: SubGoalAccordionProps) {
  if (subGoals.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-md3-on-surface">
        Sub-Goals
        <span className="px-2 py-0.5 rounded-full bg-md3-surface-container text-xs">
          {subGoals.length}
        </span>
      </h3>

      <div className="divide-y divide-md3-outline-variant/10 border border-md3-outline-variant/15 rounded-xl bg-md3-surface-lowest overflow-hidden">
        {subGoals.map((sg) => {
          const { label, color } = statusLabel(sg.status);
          const unit = sg.unit || '%';
          const previewLabel = sg.valuePreview
            ?? (sg.current != null ? `${sg.current}${unit === '%' ? '%' : ` ${unit}`}` : undefined);

          return (
            <Link
              key={sg.id}
              href={sg.href}
              className="group block px-4 py-4 transition-colors hover:bg-slate-50 sm:px-6 sm:py-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-md3-surface-container font-bold text-sm text-md3-on-surface">
                    {sg.goalNumber || <MaterialIcon icon="account_tree" size={18} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="block font-bold text-md3-on-surface">{sg.title}</span>
                      {sg.childCount != null && sg.childCount > 0 && (
                        <span className="rounded-full bg-md3-surface-container px-2 py-0.5 text-[11px] font-medium text-md3-on-surface-variant">
                          {sg.childCount} {sg.childCount === 1 ? 'child' : 'children'}
                        </span>
                      )}
                    </div>
                    {sg.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-md3-on-surface-variant leading-relaxed">
                        {sg.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-md3-on-surface-variant">
                      {previewLabel && (
                        <span>
                          Current: <strong className="text-md3-on-surface">{previewLabel}</strong>
                        </span>
                      )}
                      {sg.target != null && (
                        <span>
                          Target: <strong className="text-md3-on-surface">{sg.target}{unit === '%' ? '%' : ` ${unit}`}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:shrink-0 sm:justify-start">
                  <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>
                    {label}
                  </span>
                  <MaterialIcon
                    icon="chevron_right"
                    className="text-md3-on-surface-variant transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
