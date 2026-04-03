'use client'
import { usePathname } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { usePublicSidebar } from './PublicSidebarContext';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import type { HierarchicalGoal } from '@/lib/types';

interface PublicSidebarTreeProps {
  objectives: HierarchicalGoal[];
}

function statusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'on target':
    case 'on_target':
    case 'exceeding':
      return 'bg-emerald-500';
    case 'at risk':
    case 'at_risk':
    case 'in progress':
    case 'in_progress':
      return 'bg-amber-400';
    case 'critical':
    case 'off track':
    case 'off_track':
      return 'bg-red-500';
    default:
      return 'bg-slate-300';
  }
}

function statusDotColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'on target':
    case 'on_target':
    case 'exceeding':
      return 'bg-emerald-400';
    case 'at risk':
    case 'at_risk':
    case 'in progress':
    case 'in_progress':
      return 'bg-amber-400';
    case 'critical':
    case 'off track':
    case 'off_track':
      return 'bg-red-400';
    default:
      return 'bg-slate-300';
  }
}

export function PublicSidebarTree({ objectives }: PublicSidebarTreeProps) {
  const pathname = usePathname();
  const { slug } = useSubdomain();
  const basePath = `/district/${slug}`;
  const { expandedNodes, toggleNode } = usePublicSidebar();

  return (
    <div className="space-y-1">
      {objectives.map((obj) => {
        const isExpanded = expandedNodes.has(obj.id);
        const objPath = `${basePath}/objectives/${obj.id}`;
        const isActive = pathname === objPath;

        return (
          <div key={obj.id}>
            <button
              onClick={() => toggleNode(obj.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-white ghost-border text-slate-900 font-medium'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(obj.status)}`} />
                <span className="text-xs font-medium truncate">{obj.title}</span>
              </div>
              <span className="text-[10px] font-bold tabular-nums text-slate-400">
                {obj.overall_progress != null ? `${obj.overall_progress}%` : '--'}
              </span>
            </button>

            {isExpanded && obj.children && obj.children.length > 0 && (
              <div className="ml-4 flex flex-col gap-1 py-1">
                {obj.children.map((child) => {
                  const goalPath = `${basePath}/goals/${child.id}`;
                  const isGoalActive = pathname === goalPath;
                  return (
                    <a
                      key={child.id}
                      href={goalPath}
                      className={`text-[11px] py-1 flex items-center gap-2 transition-colors ${
                        isGoalActive
                          ? 'text-violet-600 font-semibold'
                          : 'text-slate-500 hover:text-violet-600'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${statusDotColor(child.status)}`} />
                      <span className="truncate">
                        {child.goal_number} {child.title}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
