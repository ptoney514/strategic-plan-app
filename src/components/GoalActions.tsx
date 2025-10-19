import React, { useState } from 'react';
import { Pencil, Trash2, Plus, MoreVertical } from 'lucide-react';
import { useDeleteGoal } from '../hooks/useGoals';
import { ConfirmDialog } from './Modal';
import type { Goal } from '../lib/types';

interface GoalActionsProps {
  goal: Goal;
  onEdit?: () => void;
  onAddChild?: () => void;
  canAddChild?: boolean;
}

export function GoalActions({ goal, onEdit, onAddChild, canAddChild = false }: GoalActionsProps) {
  const deleteGoal = useDeleteGoal();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteGoal.mutateAsync(goal.id);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-md hover:bg-secondary transition-colors"
          aria-label="Goal actions"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-48 bg-card border border-border rounded-md shadow-lg py-1">
            {onEdit && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit Goal
              </button>
            )}
            
            {canAddChild && onAddChild && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onAddChild();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Sub-goal
              </button>
            )}
            
            <hr className="my-1 border-border" />
            
            <button
              onClick={() => {
                setShowMenu(false);
                setShowConfirmDelete(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Goal
            </button>
          </div>
        </>
      )}
      </div>
      
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goal.title}"? This action cannot be undone and will also delete all sub-goals and metrics.`}
        confirmText="Delete Goal"
        variant="danger"
      />
    </>
  );
}