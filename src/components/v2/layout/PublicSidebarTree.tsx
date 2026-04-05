'use client'
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSubdomain } from '@/contexts/SubdomainContext';
import { usePublicSidebar } from './PublicSidebarContext';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import type { HierarchicalGoal } from '@/lib/types';
import { findGoalLineage } from '@/lib/utils/goalTree';

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

export function PublicSidebarTree({ objectives }: PublicSidebarTreeProps) {
  const pathname = usePathname();
  const { slug } = useSubdomain();
  const basePath = `/district/${slug}`;
  const {
    activeNodeId,
    closeMobile,
    expandedNodes,
    expandToNode,
    setActiveNode,
    toggleNode,
  } = usePublicSidebar();

  const currentGoalId = useMemo(() => {
    const match = pathname.match(/\/(?:objectives|goals)\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const activeLineage = useMemo(() => {
    if (!currentGoalId) return [];
    return findGoalLineage(objectives, currentGoalId);
  }, [currentGoalId, objectives]);

  useEffect(() => {
    setActiveNode(currentGoalId);
    if (activeLineage.length > 0) {
      expandToNode(activeLineage.map((goal) => goal.id));
    }
  }, [activeLineage, currentGoalId, expandToNode, setActiveNode]);

  const activeLineageIds = useMemo(
    () => new Set(activeLineage.map((goal) => goal.id)),
    [activeLineage],
  );

  const renderNode = (node: HierarchicalGoal, depth: number) => {
    const isObjective = node.level === 0;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = activeNodeId === node.id;
    const isInActiveLineage = activeLineageIds.has(node.id);
    const href = isObjective
      ? `${basePath}/objectives/${node.id}`
      : `${basePath}/goals/${node.id}`;
    const valueLabel = node.overall_progress != null ? `${node.overall_progress}%` : '--';
    const label = isObjective ? node.title : `${node.goal_number} ${node.title}`;

    return (
      <div key={node.id} className="space-y-1">
        <div className="flex items-stretch gap-1">
          <Link
            href={href}
            onClick={() => closeMobile()}
            className={`min-w-0 flex-1 flex items-center gap-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-white ghost-border text-violet-700 font-semibold'
                : isInActiveLineage
                ? 'bg-white/80 text-slate-900'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={{ padding: '8px 12px', paddingLeft: `${12 + depth * 14}px` }}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(node.status)}`} />
            <span className="min-w-0 flex-1 truncate text-xs font-medium">{label}</span>
            <span className="text-[10px] font-bold tabular-nums text-slate-400">
              {valueLabel}
            </span>
          </Link>

          {hasChildren && (
            <button
              type="button"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
              onClick={() => toggleNode(node.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isActive || isInActiveLineage
                  ? 'bg-white text-violet-600 ghost-border'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <MaterialIcon
                icon={isExpanded ? 'expand_more' : 'chevron_right'}
                size={18}
              />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {objectives.map((objective) => renderNode(objective, 0))}
    </div>
  );
}
