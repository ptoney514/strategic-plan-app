import React, { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { useUpdateGoal } from '../hooks/useGoals';
import { useMetrics, useCreateMetric, useUpdateMetric, useDeleteMetric } from '../hooks/useMetrics';
import { MetricBuilderWizard } from './MetricBuilderWizard';
import type { Goal, Metric } from '../lib/types';

interface GoalBuilderProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GoalBuilder({ goal, isOpen, onClose, onSuccess }: GoalBuilderProps) {
  console.log('[GoalBuilder] Component loaded - NEW VERSION with metrics management');
  const updateGoalMutation = useUpdateGoal();
  const { data: metrics, refetch: refetchMetrics, isLoading: isLoadingMetrics } = useMetrics(goal?.id || '');
  const createMetricMutation = useCreateMetric();
  const updateMetricMutation = useUpdateMetric();
  const deleteMetricMutation = useDeleteMetric();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    indicator_text: '',
    indicator_color: '#10b981',
    show_progress_bar: true
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [showMetricWizard, setShowMetricWizard] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefetchingMetrics, setIsRefetchingMetrics] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        indicator_text: goal.indicator_text || '',
        indicator_color: goal.indicator_color || '#10b981',
        show_progress_bar: goal.show_progress_bar !== false // default to true if not set
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!goal || !validateForm()) return;

    setIsSaving(true);
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        indicator_text: formData.indicator_text || undefined,
        indicator_color: formData.indicator_color || undefined,
        show_progress_bar: formData.show_progress_bar
      };

      console.log('[GoalBuilder] Saving goal updates:', updates);

      await updateGoalMutation.mutateAsync({
        id: goal.id,
        updates
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMetric = async (metricData: any) => {
    setIsRefetchingMetrics(true);
    try {
      await createMetricMutation.mutateAsync(metricData);
      // Force refetch to ensure new metric appears immediately
      await refetchMetrics();
    } finally {
      setIsRefetchingMetrics(false);
    }
  };

  const handleUpdateMetric = async (metricData: any) => {
    if (!editingMetric) return;
    setIsRefetchingMetrics(true);
    try {
      console.log('[GoalBuilder] Updating metric:', editingMetric.id, metricData);
      await updateMetricMutation.mutateAsync({
        id: editingMetric.id,
        updates: metricData
      });
      // Force refetch to ensure updated metric appears immediately
      await refetchMetrics();
      console.log('[GoalBuilder] Metric updated successfully');
    } finally {
      setIsRefetchingMetrics(false);
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    if (confirm('Are you sure you want to delete this metric?')) {
      setIsRefetchingMetrics(true);
      try {
        await deleteMetricMutation.mutateAsync(metricId);
        // Force refetch to ensure deleted metric is removed immediately
        await refetchMetrics();
      } finally {
        setIsRefetchingMetrics(false);
      }
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Edit Goal {goal.goal_number}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage goal details and metrics
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
            {/* Goal Information Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Goal Information</h4>

              {/* Goal Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Goal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter goal title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">{formData.title.length} / 200 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.description ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Describe this goal and what it aims to achieve"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Visual Badge */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Visual Badge (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={formData.indicator_text}
                      onChange={(e) => setFormData({ ...formData, indicator_text: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md"
                      placeholder="e.g., Featured, On Track"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Badge Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.indicator_color}
                        onChange={(e) => setFormData({ ...formData, indicator_color: e.target.value })}
                        className="h-10 w-16 rounded border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.indicator_color}
                        onChange={(e) => setFormData({ ...formData, indicator_color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-border rounded-md font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
                {formData.indicator_text && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1"
                      style={{
                        backgroundColor: formData.indicator_color,
                        color: '#ffffff'
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                      {formData.indicator_text}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar Toggle */}
              <div className="space-y-3 pt-4 border-t border-border">
                <label className="block text-sm font-medium">Progress Bar</label>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Show Progress Bar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Display a progress indicator on the public dashboard
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, show_progress_bar: !formData.show_progress_bar })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.show_progress_bar ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.show_progress_bar ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Metrics & Visualizations</h4>
                  <p className="text-xs text-muted-foreground mt-1">Add charts, graphs, and data visualizations to track this goal</p>
                </div>
                <button
                  onClick={() => {
                    setEditingMetric(null);
                    setShowMetricWizard(true);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Metric
                </button>
              </div>

              {/* Metrics List */}
              {isLoadingMetrics || isRefetchingMetrics ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-muted-foreground text-sm">Loading metrics...</p>
                </div>
              ) : metrics && metrics.length > 0 ? (
                <div className="space-y-2">
                  {metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <button className="cursor-grab p-1 hover:bg-muted rounded">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm">{metric.metric_name || metric.name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {metric.visualization_type || metric.chart_type || 'No visualization'} •
                          {metric.description ? ` ${metric.description.substring(0, 50)}...` : ' No description'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingMetric(metric);
                            setShowMetricWizard(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                          title="Edit metric"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMetric(metric.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded"
                          title="Delete metric"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-sm">No metrics added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Metric" to create your first visualization</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Update Goal'}
            </button>
          </div>
        </div>
      </div>

      {/* Metric Builder Wizard */}
      <MetricBuilderWizard
        isOpen={showMetricWizard}
        onClose={() => {
          setShowMetricWizard(false);
          setEditingMetric(null);
        }}
        onSave={editingMetric ? handleUpdateMetric : handleCreateMetric}
        goalId={goal.id}
        goalNumber={goal.goal_number}
        existingMetric={editingMetric}
      />
    </>
  );
}
