'use client'
import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';

export interface SubGoalItem {
  id: string;
  title: string;
  description?: string;
  target?: number;
  current?: number;
  unit?: string;
  status?: string;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (subGoals.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold tracking-tight text-md3-on-surface flex items-center gap-2">
        Sub-Goals
        <span className="px-2 py-0.5 rounded-full bg-md3-surface-container text-xs">
          {subGoals.length}
        </span>
      </h3>

      <div className="divide-y divide-md3-outline-variant/10 border border-md3-outline-variant/15 rounded-xl bg-md3-surface-lowest overflow-hidden">
        {subGoals.map((sg) => {
          const isExpanded = expandedId === sg.id;
          const { label, color } = statusLabel(sg.status);
          const unit = sg.unit || 'Hours';

          return (
            <div key={sg.id} className="group">
              <button
                onClick={() => setExpandedId(isExpanded ? null : sg.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <MaterialIcon
                    icon={label === 'Completed' ? 'school' : 'workspace_premium'}
                    fill
                    className="text-md3-tertiary"
                  />
                  <div>
                    <span className="block font-bold text-md3-on-surface">{sg.title}</span>
                    {sg.target != null && sg.current != null && (
                      <span className="text-xs text-md3-on-surface-variant">
                        Target: {sg.target} {unit} &bull; Current: {sg.current} {unit}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>
                    {label}
                  </span>
                  <MaterialIcon
                    icon="expand_more"
                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isExpanded && sg.description && (
                <div className="px-16 pb-6">
                  <p className="text-sm text-md3-on-surface-variant leading-relaxed">
                    {sg.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
