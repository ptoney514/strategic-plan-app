import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronDown, Target, GripVertical } from 'lucide-react';
import type { Goal } from '../../lib/types';
import { useReorderAndRenumberGoals } from '../../hooks/useGoals';

interface DraggableGoalsTreeProps {
  goals: Goal[];
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string) => void;
  districtId: string;
  onRefresh?: () => void;
}

interface SortableGoalNodeProps {
  goal: Goal;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  expandedIds: Set<string>;
  selectedGoalId: string | null;
  onSelectGoal: (goalId: string) => void;
  onToggleExpand: (goalId: string) => void;
}

function SortableGoalNode({
  goal,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  expandedIds,
  selectedGoalId,
  onSelectGoal,
  onToggleExpand,
}: SortableGoalNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = goal.children && goal.children.length > 0;
  const paddingLeft = level === 0 ? 16 : level * 24 + 16;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          group relative flex items-center gap-2 py-3 px-4 cursor-pointer transition-all
          border-l-3
          ${isSelected
            ? 'bg-blue-50 border-l-blue-600 hover:bg-blue-50'
            : 'border-l-transparent hover:bg-gray-50 hover:border-l-gray-300'
          }
          ${level === 0 ? 'py-4' : ''}
        `}
      >
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div
          className="flex items-center gap-3 flex-1"
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={onSelect}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              title={isExpanded ? "Collapse to hide child goals" : "Expand to see child goals"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasChildren && level > 0 && <div className="w-8 flex-shrink-0" />}

          {/* Goal Icon for strategic objectives */}
          {level === 0 && (
            <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Target className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
            </div>
          )}

          {/* Goal Number & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={`
                font-semibold flex-shrink-0
                ${level === 0 ? 'text-base' : 'text-sm'}
                ${isSelected ? 'text-blue-900' : 'text-gray-800'}
              `}>
                {goal.goal_number}
              </span>
              <span className={`
                truncate
                ${level === 0 ? 'text-sm' : 'text-sm'}
                ${isSelected ? 'text-blue-800' : 'text-gray-600'}
              `}>
                {goal.title}
              </span>
            </div>
          </div>

          {/* Status indicator */}
          {goal.indicator_text && (
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: goal.indicator_color || '#10b981' }}
              title={goal.indicator_text}
            />
          )}
        </div>
      </div>

      {/* Render children recursively */}
      {hasChildren && isExpanded && goal.children && (
        <SortableContext
          items={goal.children.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          {goal.children.map((child) => (
            <SortableGoalNode
              key={child.id}
              goal={child}
              level={level + 1}
              isExpanded={expandedIds.has(child.id)}
              isSelected={selectedGoalId === child.id}
              onToggle={() => onToggleExpand(child.id)}
              onSelect={() => onSelectGoal(child.id)}
              expandedIds={expandedIds}
              selectedGoalId={selectedGoalId}
              onSelectGoal={onSelectGoal}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </SortableContext>
      )}
    </>
  );
}

export function DraggableGoalsTree({
  goals,
  selectedGoalId,
  onSelectGoal,
  districtId,
  onRefresh,
}: DraggableGoalsTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localGoals, setLocalGoals] = useState(goals);
  const reorderMutation = useReorderAndRenumberGoals();

  React.useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  // Auto-expand goal when selected (so child goals are visible for reordering)
  React.useEffect(() => {
    if (selectedGoalId) {
      setExpandedIds(prev => {
        const newSet = new Set(prev);
        newSet.add(selectedGoalId);
        return newSet;
      });
    }
  }, [selectedGoalId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleExpand = (goalId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedIds(newExpanded);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    console.log('🔄 [DragStart] Started dragging:', event.active.id);
  };

  // Helper function to find a goal and its parent
  const findGoalAndParent = (
    goals: Goal[],
    goalId: string,
    parentId: string | null = null
  ): { goal: Goal; parentId: string | null; siblings: Goal[] } | null => {
    for (const goal of goals) {
      if (goal.id === goalId) {
        return { goal, parentId, siblings: goals };
      }
      if (goal.children) {
        const found = findGoalAndParent(goal.children, goalId, goal.id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('🔄 [DragEnd] Drag ended:', { active: active.id, over: over?.id });

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Find the dragged goal and its siblings
    const activeInfo = findGoalAndParent(localGoals, active.id as string);
    const overInfo = findGoalAndParent(localGoals, over.id as string);

    if (!activeInfo || !overInfo) {
      console.error('❌ [DragEnd] Could not find goal info');
      setActiveId(null);
      return;
    }

    // Only allow reordering within the same parent
    if (activeInfo.parentId !== overInfo.parentId) {
      console.warn('⚠️ [DragEnd] Cannot move between different parents');
      setActiveId(null);
      return;
    }

    const siblings = activeInfo.siblings;
    const oldIndex = siblings.findIndex((g) => g.id === active.id);
    const newIndex = siblings.findIndex((g) => g.id === over.id);

    console.log('🔄 [DragEnd] Reordering:', {
      oldIndex,
      newIndex,
      parentId: activeInfo.parentId,
      districtId,
    });

    // Reorder the siblings
    const newSiblings = arrayMove(siblings, oldIndex, newIndex);

    // Update order positions
    const updates = newSiblings.map((goal, index) => ({
      id: goal.id,
      order_position: index,
    }));

    console.log('🔄 [DragEnd] Updates to apply:', updates);

    try {
      await reorderMutation.mutateAsync({
        districtId,
        parentId: activeInfo.parentId,
        reorderedGoals: updates,
      });
      console.log('✅ [DragEnd] Reorder successful!');
      onRefresh?.();
    } catch (error) {
      console.error('❌ [DragEnd] Failed to reorder goals:', error);
      // Revert on error
      setLocalGoals(goals);
    }

    setActiveId(null);
  };

  // Find the active goal for drag overlay
  const findGoal = (goals: Goal[], id: string): Goal | null => {
    for (const goal of goals) {
      if (goal.id === id) return goal;
      if (goal.children) {
        const found = findGoal(goal.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeGoal = activeId ? findGoal(localGoals, activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localGoals.map((g) => g.id)}
        strategy={verticalListSortingStrategy}
      >
        {localGoals.map((goal) => (
          <SortableGoalNode
            key={goal.id}
            goal={goal}
            level={0}
            isExpanded={expandedIds.has(goal.id)}
            isSelected={selectedGoalId === goal.id}
            onToggle={() => toggleExpand(goal.id)}
            onSelect={() => onSelectGoal(goal.id)}
            expandedIds={expandedIds}
            selectedGoalId={selectedGoalId}
            onSelectGoal={onSelectGoal}
            onToggleExpand={toggleExpand}
          />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeGoal && (
          <div className="bg-white rounded-lg border-2 border-blue-500 p-3 shadow-xl">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-blue-500" />
              <div>
                <span className="font-semibold text-sm text-gray-800">
                  {activeGoal.goal_number}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  {activeGoal.title}
                </span>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
