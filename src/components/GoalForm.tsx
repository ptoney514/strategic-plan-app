import React, { useState, useEffect } from 'react';
import { useCreateGoal, useUpdateGoal } from '../hooks/useGoals';
import type { Goal } from '../lib/types';

interface GoalFormProps {
  goal?: Goal | null;
  districtId: string;
  parentId?: string | null;
  level: 0 | 1 | 2;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GoalForm({ goal, districtId, parentId, level, onSuccess, onCancel }: GoalFormProps) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    target_date: goal?.target_date || '',
    status: goal?.status || 'not-started' as Goal['status'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        target_date: goal.target_date || '',
        status: goal.status,
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (goal) {
        // Update existing goal
        await updateGoal.mutateAsync({
          id: goal.id,
          updates: formData
        });
      } else {
        // Create new goal
        await createGoal.mutateAsync({
          ...formData,
          district_id: districtId,
          parent_id: parentId,
          level,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors({ submit: 'Failed to save goal. Please try again.' });
    }
  };

  const statusOptions: Goal['status'][] = ['not-started', 'in-progress', 'completed', 'on-hold'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter goal title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter goal description"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Goal['status'] })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="target_date" className="block text-sm font-medium text-foreground mb-1">
          Target Date
        </label>
        <input
          type="date"
          id="target_date"
          value={formData.target_date}
          onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={createGoal.isPending || updateGoal.isPending}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createGoal.isPending || updateGoal.isPending ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
}