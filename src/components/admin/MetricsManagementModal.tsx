import { X, BarChart3, Edit2, Trash2, Plus } from 'lucide-react';
import type { Goal, Metric } from '../../lib/types';
import { useEffect, useState } from 'react';
import { MetricEditForm } from './MetricEditForm';

interface MetricsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  metrics: Metric[];
  onMetricSave?: (metricId: string, updates: Partial<Metric>) => Promise<void>;
  onMetricDelete?: (metricId: string) => Promise<void>;
  onMetricAdd?: () => void;
}

interface MetricListItemProps {
  metric: Metric;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * MetricListItem - Collapsed view of a metric with edit/delete buttons
 */
function MetricListItem({ metric, onEdit, onDelete }: MetricListItemProps) {
  return (
    <div className="bg-[#fafaf8] border border-[#e8e6e1] rounded-lg p-4 hover:border-[#d4d1cb] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">
            {metric.metric_name || metric.name}
          </h4>
          {metric.description && (
            <p className="text-[12px] text-[#6a6a6a] line-clamp-2">
              {metric.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-[#8a8a8a]">
            {metric.current_value != null && (
              <span>
                Current: <span className="font-semibold text-[#1a1a1a]">{metric.current_value}</span>
              </span>
            )}
            {metric.target_value != null && (
              <span>
                Target: <span className="font-semibold text-[#1a1a1a]">{metric.target_value}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-[#6a6a6a] hover:text-[#1a1a1a] hover:bg-white border border-transparent hover:border-[#e8e6e1] rounded-lg transition-colors"
            title="Edit metric"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete metric "${metric.metric_name || metric.name}"?`)) {
                onDelete();
              }
            }}
            className="p-2 text-[#6a6a6a] hover:text-[#ef4444] hover:bg-white border border-transparent hover:border-[#e8e6e1] rounded-lg transition-colors"
            title="Delete metric"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MetricsManagementModal - Modal for managing metrics associated with a goal
 * Supports expandable inline editing with live chart preview
 */
export function MetricsManagementModal({
  isOpen,
  onClose,
  goal,
  metrics,
  onMetricSave,
  onMetricDelete,
  onMetricAdd,
}: MetricsManagementModalProps) {
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);

  // ESC key handler - close edit mode first, then modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingMetricId) {
          setEditingMetricId(null); // Close edit mode first
        } else {
          onClose(); // Then close modal
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, editingMetricId]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e6e1]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f5f3ef] flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-[#6a6a6a]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#1a1a1a]">
                  Manage Metrics
                </h2>
                <p className="text-[12px] text-[#8a8a8a]">
                  Goal {goal.goal_number}: {goal.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#f5f3ef] transition-colors"
            >
              <X className="h-5 w-5 text-[#6a6a6a]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {metrics.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#f5f3ef] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-[#8a8a8a]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-2">
                  No metrics yet
                </h3>
                <p className="text-[13px] text-[#8a8a8a] mb-4">
                  Add metrics to track progress for this goal
                </p>
              </div>
            ) : (
              // Metrics list with expandable edit mode
              <div className="space-y-3">
                <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-3">
                  Existing Metrics ({metrics.length})
                </h3>
                {metrics.map((metric) => {
                  const isEditing = editingMetricId === metric.id;

                  return isEditing ? (
                    // Edit mode: Show MetricEditForm
                    <MetricEditForm
                      key={metric.id}
                      metric={metric}
                      onSave={async (updates) => {
                        if (onMetricSave) {
                          await onMetricSave(metric.id, updates);
                          setEditingMetricId(null);
                        }
                      }}
                      onCancel={() => setEditingMetricId(null)}
                    />
                  ) : (
                    // View mode: Show MetricListItem
                    <MetricListItem
                      key={metric.id}
                      metric={metric}
                      onEdit={() => setEditingMetricId(metric.id)}
                      onDelete={() => {
                        if (onMetricDelete) {
                          onMetricDelete(metric.id);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Add New Metric Button */}
            {onMetricAdd && (
              <button
                onClick={onMetricAdd}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold text-[#1a1a1a] bg-[#f5f3ef] border-2 border-dashed border-[#d4d1cb] rounded-lg hover:bg-[#e8e6e1] hover:border-[#b8b5ad] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Metric
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e8e6e1] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
