'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import type { HierarchicalGoal } from '../../../lib/types';
import { useUpdateGoal, useDeleteGoal } from '../../../hooks/v2/useGoals';
import { AddGoalInline } from './AddGoalInline';

interface GoalTreeItemProps {
  goal: HierarchicalGoal;
  planId: string;
  districtId: string;
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
] as const;

const LEVEL_BADGE_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: '#dbeafe', text: '#1e40af', label: 'L0' },
  1: { bg: '#ede9fe', text: '#6d28d9', label: 'L1' },
  2: { bg: '#dcfce7', text: '#166534', label: 'L2' },
};

const INDENT: Record<number, string> = {
  0: 'ml-0',
  1: 'ml-8',
  2: 'ml-16',
};

export function GoalTreeItem({ goal, planId, districtId }: GoalTreeItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [showAddChild, setShowAddChild] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const updateGoal = useUpdateGoal(planId);
  const deleteGoal = useDeleteGoal(planId);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  function handleTitleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== goal.title) {
      updateGoal.mutate({ id: goal.id, updates: { title: trimmed } });
    } else {
      setEditTitle(goal.title);
    }
    setIsEditing(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(goal.title);
      setIsEditing(false);
    }
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateGoal.mutate({
      id: goal.id,
      updates: { status: e.target.value } as Partial<HierarchicalGoal>,
    });
  }

  function handleDelete() {
    if (window.confirm('Delete this goal and all sub-goals?')) {
      deleteGoal.mutate(goal.id);
    }
  }

  const badge = LEVEL_BADGE_STYLES[goal.level] || LEVEL_BADGE_STYLES[0];
  const childLevel = (goal.level + 1) as 0 | 1 | 2;

  return (
    <div className={INDENT[goal.level] || ''}>
      <div
        className="flex items-center gap-3 py-2.5 px-3 group transition-colors"
        style={{ borderBottom: '1px solid var(--editorial-border)' }}
      >
        {/* Level badge */}
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {badge.label}
        </span>

        {/* Goal number */}
        <span
          className="font-mono text-xs shrink-0"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          {goal.goal_number}
        </span>

        {/* Title (click to edit) */}
        {isEditing ? (
          <input
            ref={editRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="flex-1 px-2 py-0.5 rounded text-sm outline-hidden"
            style={{
              backgroundColor: 'var(--editorial-bg)',
              border: '1px solid var(--editorial-accent-primary)',
              color: 'var(--editorial-text-primary)',
            }}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 text-left text-sm truncate hover:underline cursor-text"
            style={{ color: 'var(--editorial-text-primary)' }}
          >
            {goal.title}
          </button>
        )}

        {/* Status dropdown */}
        <select
          value={goal.status || 'not_started'}
          onChange={handleStatusChange}
          className="text-xs rounded px-2 py-1 cursor-pointer outline-hidden"
          style={{
            backgroundColor: 'var(--editorial-surface)',
            border: '1px solid var(--editorial-border)',
            color: 'var(--editorial-text-secondary)',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Detail page link */}
        <button
          onClick={() => router.push(`/admin/goals/${goal.id}`)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
          style={{ color: 'var(--editorial-text-secondary)' }}
          title="View goal details"
        >
          <ExternalLink className="h-4 w-4" />
        </button>

        {/* Add sub-goal button (only for L0 and L1) */}
        {goal.level < 2 && (
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
            style={{ color: 'var(--editorial-text-secondary)' }}
            title="Add sub-goal"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity"
          style={{ color: '#ef4444' }}
          title="Delete goal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Inline add child */}
      {showAddChild && (
        <div className={INDENT[childLevel] || 'ml-16'}>
          <AddGoalInline
            planId={planId}
            districtId={districtId}
            parentId={goal.id}
            level={childLevel}
            onCancel={() => setShowAddChild(false)}
          />
        </div>
      )}

      {/* Recursive children */}
      {goal.children?.map((child) => (
        <GoalTreeItem key={child.id} goal={child} planId={planId} districtId={districtId} />
      ))}
    </div>
  );
}
