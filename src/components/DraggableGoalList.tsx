import React, { useState, useEffect } from 'react';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { GripVertical, Target, ChevronRight } from 'lucide-react';
import { useReorderGoals } from '../hooks/useGoals';
import type { HierarchicalGoal } from '../lib/types';
import { calculateGoalProgress, getGoalStatus } from '../lib/types';
import { GoalActions } from './GoalActions';

interface DraggableGoalListProps {
  goals: HierarchicalGoal[];
  slug: string;
  onEdit?: (goal: HierarchicalGoal) => void;
  onRefresh?: () => void;
}

interface SortableGoalItemProps {
  goal: HierarchicalGoal;
  slug: string;
  onEdit?: (goal: HierarchicalGoal) => void;
}

function SortableGoalItem({ goal, slug, onEdit }: SortableGoalItemProps) {
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

  const progress = calculateGoalProgress(goal);
  const status = getGoalStatus(goal);

  const statusColors = {
    'on-track': 'bg-green-100 text-green-800 border-green-200',
    'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'critical': 'bg-red-100 text-red-800 border-red-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all hover:border-primary/50"
    >
      <div className="flex items-start gap-4">
        <button
          className="mt-1 cursor-move text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <Link to={`/${slug}/goals/${goal.id}`} className="flex-1">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Objective {goal.goal_number}
                </span>
                <h3 className="text-lg font-semibold text-card-foreground mt-1">
                  {goal.title}
                </h3>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[status]}`}>
                {status.replace('-', ' ')}
              </span>
              <GoalActions
                goal={goal}
                onEdit={() => onEdit?.(goal)}
                onAddChild={() => {
                  window.location.href = `/${slug}/goals/${goal.id}`;
                }}
                canAddChild={goal.level < 2}
              />
            </div>
          </div>

          {goal.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {goal.description}
            </p>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-card-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Link to={`/${slug}/goals/${goal.id}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Target className="h-4 w-4 mr-1" />
              <span>{goal.children?.length || 0} sub-goals</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DraggableGoalList({ goals, slug, onEdit, onRefresh }: DraggableGoalListProps) {
  const [items, setItems] = useState(goals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const reorderGoals = useReorderGoals();

  useEffect(() => {
    setItems(goals);
  }, [goals]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order positions
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order_position: index,
      }));

      try {
        await reorderGoals.mutateAsync(updates);
        onRefresh?.();
      } catch (error) {
        console.error('Failed to reorder goals:', error);
        // Revert on error
        setItems(goals);
      }
    }

    setActiveId(null);
  };

  const activeGoal = activeId ? items.find((item) => item.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((goal) => (
            <SortableGoalItem
              key={goal.id}
              goal={goal}
              slug={slug}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeGoal && (
          <div className="bg-card rounded-lg border-2 border-primary p-6 shadow-xl opacity-90">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-primary" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Objective {activeGoal.goal_number}
                </span>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {activeGoal.title}
                </h3>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}