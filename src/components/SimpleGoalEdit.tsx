import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateGoal } from '../hooks/useGoals';
import type { Goal } from '../lib/types';

interface SimpleGoalEditProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SimpleGoalEdit({ goal, isOpen, onClose, onSuccess }: SimpleGoalEditProps) {
  const updateGoalMutation = useUpdateGoal();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    indicator_text: '',
    indicator_color: '#10b981'
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        indicator_text: goal.indicator_text || '',
        indicator_color: goal.indicator_color || '#10b981'
      });
    }
  }, [goal]);

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!goal || !validateForm()) return;

    try {
      await updateGoalMutation.mutateAsync({
        id: goal.id,
        data: {
          title: formData.title,
          description: formData.description,
          indicator_text: formData.indicator_text || undefined,
          indicator_color: formData.indicator_color || undefined
        }
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Edit Goal</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Define the basic information for your goal
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter goal title..."
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length} / 200 characters
            </p>
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Enter goal description..."
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Visual Badge (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <label className="block text-sm font-medium">
                Visual Badge (Optional)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">Badge Text</label>
                <input
                  type="text"
                  value={formData.indicator_text}
                  onChange={(e) => setFormData({ ...formData, indicator_text: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Priority, Featured"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">Badge Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.indicator_color}
                    onChange={(e) => setFormData({ ...formData, indicator_color: e.target.value })}
                    className="h-10 w-20 rounded border border-border cursor-pointer"
                  />
                  <div
                    className="flex-1 h-10 rounded border border-border"
                    style={{ backgroundColor: formData.indicator_color }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                ℹ️ Measures can be added after creating the goal
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border hover:bg-muted rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateGoalMutation.isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateGoalMutation.isPending ? 'Updating...' : 'Update Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}
