import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGoal, useUpdateGoal } from '../hooks/useGoals';
import type { Goal } from '../lib/types';
import { Loader2 } from 'lucide-react';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  target_date: z.string().optional(),
  status: z.enum(['not-started', 'in-progress', 'completed', 'on-hold']),
  owner_name: z.string().optional(),
  department: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormManagedProps {
  goal?: Goal | null;
  districtId: string;
  parentId?: string | null;
  level: 0 | 1 | 2;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GoalFormManaged({ 
  goal, 
  districtId, 
  parentId, 
  level, 
  onSuccess, 
  onCancel 
}: GoalFormManagedProps) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || '',
      description: goal?.description || '',
      target_date: goal?.target_date || '',
      status: goal?.status || 'not-started',
      owner_name: goal?.owner_name || '',
      department: goal?.department || '',
      priority: goal?.priority || 'medium',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          updates: data
        });
      } else {
        await createGoal.mutateAsync({
          ...data,
          district_id: districtId,
          parent_id: parentId,
          level,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving goal:', error);
      setError('root', {
        message: 'Failed to save goal. Please try again.'
      });
    }
  };

  const levelName = level === 0 ? 'Strategic Objective' : level === 1 ? 'Goal' : 'Sub-goal';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
            {levelName} Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={`Enter ${levelName.toLowerCase()} title`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Provide a detailed description of this goal"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="owner_name" className="block text-sm font-medium text-foreground mb-1">
            Owner
          </label>
          <input
            type="text"
            id="owner_name"
            {...register('owner_name')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Goal owner's name"
          />
          {errors.owner_name && (
            <p className="mt-1 text-sm text-red-600">{errors.owner_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">
            Department
          </label>
          <input
            type="text"
            id="department"
            {...register('department')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Responsible department"
          />
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="target_date" className="block text-sm font-medium text-foreground mb-1">
            Target Date
          </label>
          <input
            type="date"
            id="target_date"
            {...register('target_date')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.target_date && (
            <p className="mt-1 text-sm text-red-600">{errors.target_date.message}</p>
          )}
        </div>
      </div>

      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || createGoal.isPending || updateGoal.isPending}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {(isSubmitting || createGoal.isPending || updateGoal.isPending) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {goal ? 'Update' : 'Create'} {levelName}
        </button>
      </div>
    </form>
  );
}