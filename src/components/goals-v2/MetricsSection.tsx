import React, { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { useCreateMetric, useUpdateMetric, useDeleteMetric } from '../../hooks';
import { MetricBuilderWizard } from '../MetricBuilderWizard';
import { MetricCard } from './MetricCard';
import type { Metric } from '../../lib/types';

interface MetricsSectionProps {
  goalId: string;
  metrics: Metric[];
  onRefresh: () => void;
}

export function MetricsSection({ goalId, metrics, onRefresh }: MetricsSectionProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);

  const createMetricMutation = useCreateMetric();
  const updateMetricMutation = useUpdateMetric();
  const deleteMetricMutation = useDeleteMetric();

  const handleAddMetric = () => {
    console.log('[MetricsSection] Opening wizard for goalId:', goalId);
    setEditingMetric(null);
    setShowWizard(true);
  };

  const handleEditMetric = (metric: Metric) => {
    setEditingMetric(metric);
    setShowWizard(true);
  };

  const handleSaveMetric = async (metricData: any) => {
    try {
      if (editingMetric) {
        // Update existing metric
        await updateMetricMutation.mutateAsync({
          id: editingMetric.id,
          updates: metricData
        });
      } else {
        // Create new metric
        await createMetricMutation.mutateAsync(metricData);
      }

      setShowWizard(false);
      setEditingMetric(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to save metric:', error);
      throw error; // Let the wizard handle the error display
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('Are you sure you want to delete this metric?')) return;

    try {
      await deleteMetricMutation.mutateAsync(metricId);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete metric:', error);
      alert('Failed to delete metric');
    }
  };

  if (metrics.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="max-w-sm mx-auto">
          <p className="text-gray-600 mb-4">No metrics defined for this goal</p>
          <button
            onClick={handleAddMetric}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add First Metric
          </button>
        </div>

        {showWizard && (
          <MetricBuilderWizard
            isOpen={showWizard}
            onClose={() => {
              setShowWizard(false);
              setEditingMetric(null);
            }}
            onSave={handleSaveMetric}
            goalId={goalId}
            goalNumber="1" // We'll need to pass this properly
            existingMetric={editingMetric}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Metric Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddMetric}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Metric
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onEdit={() => handleEditMetric(metric)}
            onDelete={() => handleDeleteMetric(metric.id)}
          />
        ))}
      </div>

      {/* Metric Builder Wizard */}
      {showWizard && (
        <MetricBuilderWizard
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            setEditingMetric(null);
          }}
          onSave={handleSaveMetric}
          goalId={goalId}
          goalNumber="1" // We'll need to pass this properly
          existingMetric={editingMetric}
        />
      )}
    </div>
  );
}
