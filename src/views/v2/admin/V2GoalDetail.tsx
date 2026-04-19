'use client'
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useSubdomain } from '../../../contexts/SubdomainContext';
import { useDistrict } from '../../../hooks/useDistricts';
import { usePlansBySlug } from '../../../hooks/v2/usePlans';
import { useGoalsByPlan, useUpdateGoal } from '../../../hooks/v2/useGoals';
import { useWidgetsByGoal, useCreateWidget, useUpdateWidget, useDeleteWidget } from '../../../hooks/v2/useWidgets';
import { WidgetGrid } from '../../../components/v2/widgets/WidgetGrid';
import { WidgetCatalog } from '../../../components/v2/widgets/WidgetCatalog';
import { WidgetConfigPanel } from '../../../components/v2/widgets/WidgetConfigPanel';
import { Button } from '../../../components/ui/Button';
import type { HierarchicalGoal } from '../../../lib/types';
import type { Widget, WidgetType, CreateWidgetPayload, UpdateWidgetPayload } from '../../../lib/types/v2';

function findGoalInHierarchy(goals: HierarchicalGoal[], id: string): HierarchicalGoal | undefined {
  for (const g of goals) {
    if (g.id === id) return g;
    const found = findGoalInHierarchy(g.children, id);
    if (found) return found;
  }
  return undefined;
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_track', label: 'On Track' },
  { value: 'off_track', label: 'Off Track' },
  { value: 'complete', label: 'Complete' },
] as const;

const PRIORITY_OPTIONS = [
  { value: '', label: 'No Priority' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

type PageState = 'view' | 'catalog' | 'config' | 'edit';

export function V2GoalDetail() {
  const params = useParams<{ goalId: string }>();
  const goalId = Array.isArray(params.goalId) ? params.goalId[0] : params.goalId;
  const router = useRouter();
  const { slug } = useSubdomain();
  const { data: district } = useDistrict(slug || '');
  const { data: plans } = usePlansBySlug(slug || '');

  const activePlan = plans?.find((p) => p.is_active) || plans?.[0];
  const planId = activePlan?.id || '';

  const { data: allGoals, isLoading: goalsLoading } = useGoalsByPlan(planId);
  const goal = allGoals && goalId ? findGoalInHierarchy(allGoals, goalId) : undefined;

  const { data: goalWidgets, isLoading: widgetsLoading } = useWidgetsByGoal(slug || '', goalId || '');
  const createWidget = useCreateWidget(slug || '');
  const updateWidget = useUpdateWidget(slug || '');
  const deleteWidget = useDeleteWidget(slug || '');
  const updateGoal = useUpdateGoal(planId);

  const [pageState, setPageState] = useState<PageState>('view');
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  // Inline editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle) titleRef.current?.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDesc) descRef.current?.focus();
  }, [isEditingDesc]);

  function handleTitleSave() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== goal?.title && goalId) {
      updateGoal.mutate({ id: goalId, updates: { title: trimmed } });
    }
    setIsEditingTitle(false);
  }

  function handleDescSave() {
    if (goalId && editDesc !== (goal?.description || '')) {
      updateGoal.mutate({ id: goalId, updates: { description: editDesc } });
    }
    setIsEditingDesc(false);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (goalId) {
      updateGoal.mutate({ id: goalId, updates: { status: e.target.value } as Partial<HierarchicalGoal> });
    }
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (goalId) {
      updateGoal.mutate({ id: goalId, updates: { priority: e.target.value || null } as Partial<HierarchicalGoal> });
    }
  }

  // Widget handlers
  function handleSelectType(type: WidgetType) {
    setSelectedType(type);
    setPageState('config');
  }

  function handleEditWidget(widget: Widget) {
    setSelectedWidget(widget);
    setSelectedType(widget.type);
    setPageState('edit');
  }

  async function handleDeleteWidget(widget: Widget) {
    await deleteWidget.mutateAsync(widget.id);
  }

  async function handleSaveWidget(data: CreateWidgetPayload | UpdateWidgetPayload) {
    if (pageState === 'edit' && selectedWidget) {
      await updateWidget.mutateAsync({ id: selectedWidget.id, data: data as UpdateWidgetPayload });
    } else {
      await createWidget.mutateAsync({ ...data, goal_id: goalId } as CreateWidgetPayload);
    }
    setPageState('view');
    setSelectedType(null);
    setSelectedWidget(null);
  }

  function handleCancelWidget() {
    setPageState('view');
    setSelectedType(null);
    setSelectedWidget(null);
  }

  if (goalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--editorial-accent-primary)' }}
        />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/admin/plans')}
          className="flex items-center gap-1.5 text-sm mb-6 hover:underline"
          style={{ color: 'var(--editorial-text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans & Goals
        </button>
        <p className="text-center py-16" style={{ color: 'var(--editorial-text-secondary)' }}>
          Goal not found.
        </p>
      </div>
    );
  }

  const goalStatus = goal.status || 'not_started';
  const goalPriority = (goal as unknown as { priority?: string }).priority || '';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <button
        onClick={() => router.push('/admin/plans')}
        className="flex items-center gap-1.5 text-sm hover:underline"
        style={{ color: 'var(--editorial-text-secondary)' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plans & Goals
      </button>

      {/* Goal header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Goal number badge */}
          <div
            className="flex items-center justify-center rounded-xl font-bold text-lg text-white shrink-0"
            style={{
              width: 48,
              height: 48,
              backgroundColor: district?.primary_color || '#1e293b',
            }}
          >
            {goal.goal_number}
          </div>

          <div className="flex-1 min-w-0">
            {/* Editable title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="flex-1 text-2xl font-bold px-2 py-1 rounded outline-hidden"
                  style={{
                    backgroundColor: 'var(--editorial-bg)',
                    border: '1px solid var(--editorial-accent-primary)',
                    color: 'var(--editorial-text-primary)',
                  }}
                />
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:underline"
                style={{ color: 'var(--editorial-text-primary)' }}
                onClick={() => {
                  setEditTitle(goal.title);
                  setIsEditingTitle(true);
                }}
                title="Click to edit title"
              >
                {goal.title}
              </h1>
            )}

            {/* Editable description */}
            {isEditingDesc ? (
              <div className="mt-2 flex items-start gap-2">
                <textarea
                  ref={descRef}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="flex-1 text-sm px-2 py-1 rounded outline-hidden resize-none"
                  style={{
                    backgroundColor: 'var(--editorial-bg)',
                    border: '1px solid var(--editorial-accent-primary)',
                    color: 'var(--editorial-text-primary)',
                  }}
                />
                <button
                  onClick={handleDescSave}
                  className="p-1.5 rounded"
                  style={{ color: 'var(--editorial-accent-primary)' }}
                  title="Save description"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p
                className="mt-1 text-sm cursor-pointer hover:underline"
                style={{ color: 'var(--editorial-text-secondary)' }}
                onClick={() => {
                  setEditDesc(goal.description || '');
                  setIsEditingDesc(true);
                }}
                title="Click to edit description"
              >
                {goal.description || 'Add a description...'}
              </p>
            )}
          </div>
        </div>

        {/* Properties row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>Status</span>
            <select
              value={goalStatus}
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>Priority</span>
            <select
              value={goalPriority}
              onChange={handlePriorityChange}
              className="text-xs rounded px-2 py-1 cursor-pointer outline-hidden"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-secondary)',
              }}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {goal.owner_name && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--editorial-text-secondary)' }}>Owner</span>
              <span className="text-xs" style={{ color: 'var(--editorial-text-primary)' }}>{goal.owner_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Widgets section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="uppercase tracking-wider text-xs font-semibold"
            style={{ color: 'var(--editorial-text-secondary)' }}
          >
            Widgets ({goalWidgets?.length || 0})
          </h2>
          {pageState === 'view' && (
            <Button onClick={() => setPageState('catalog')} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Widget
            </Button>
          )}
        </div>

        {pageState === 'view' && (
          <WidgetGrid
            widgets={goalWidgets ?? []}
            isLoading={widgetsLoading}
            onEdit={handleEditWidget}
            onDelete={handleDeleteWidget}
          />
        )}

        {pageState === 'catalog' && (
          <WidgetCatalog onSelect={handleSelectType} onClose={handleCancelWidget} />
        )}

        {(pageState === 'config' || pageState === 'edit') && selectedType && (
          <WidgetConfigPanel
            type={selectedType}
            initialData={pageState === 'edit' ? (selectedWidget ?? undefined) : undefined}
            onSave={handleSaveWidget}
            onCancel={handleCancelWidget}
          />
        )}
      </div>
    </div>
  );
}
