import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { TimeSeriesDataPoint } from '../lib/types';

interface TimeSeriesDataEntryProps {
  dataPoints: TimeSeriesDataPoint[];
  onChange: (dataPoints: TimeSeriesDataPoint[]) => void;
  disabled?: boolean;
}

export function TimeSeriesDataEntry({ dataPoints, onChange, disabled = false }: TimeSeriesDataEntryProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ date: '', value: '', target: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    setEditForm({ date: '', value: '', target: '' });
  };

  const handleSaveNew = () => {
    if (!editForm.date || !editForm.value) return;

    const newPoint: TimeSeriesDataPoint = {
      date: editForm.date,
      value: parseFloat(editForm.value),
      target: editForm.target ? parseFloat(editForm.target) : undefined
    };

    onChange([...dataPoints, newPoint]);
    setIsAdding(false);
    setEditForm({ date: '', value: '', target: '' });
  };

  const handleEdit = (index: number) => {
    const point = dataPoints[index];
    setEditingIndex(index);
    setEditForm({
      date: point.date,
      value: point.value.toString(),
      target: point.target?.toString() || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm.date || !editForm.value) return;

    const updatedPoints = [...dataPoints];
    updatedPoints[editingIndex] = {
      date: editForm.date,
      value: parseFloat(editForm.value),
      target: editForm.target ? parseFloat(editForm.target) : undefined
    };

    onChange(updatedPoints);
    setEditingIndex(null);
    setEditForm({ date: '', value: '', target: '' });
  };

  const handleDelete = (index: number) => {
    onChange(dataPoints.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setEditForm({ date: '', value: '', target: '' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Time-Series Data Points
        </label>
        {!isAdding && !disabled && (
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Data Point
          </button>
        )}
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Period/Year</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Target (Optional)</th>
              {!disabled && <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dataPoints.length === 0 && !isAdding && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No data points added yet. Click "Add Data Point" to get started.
                </td>
              </tr>
            )}

            {dataPoints.map((point, index) => (
              <tr key={index} className="hover:bg-muted/30">
                {editingIndex === index ? (
                  <>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        placeholder="2024, Q1 2024, Jan 2024"
                        className="w-full px-2 py-1 text-sm border border-border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.value}
                        onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-2 py-1 text-sm border border-border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.target}
                        onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                        placeholder="Optional"
                        className="w-full px-2 py-1 text-sm border border-border rounded"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 text-sm">{point.date}</td>
                    <td className="px-3 py-2 text-sm font-medium">{point.value}</td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{point.target || '—'}</td>
                    {!disabled && (
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(index)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}

            {isAdding && (
              <tr className="bg-blue-50/50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    placeholder="2024, Q1 2024, Jan 2024"
                    className="w-full px-2 py-1 text-sm border border-border rounded"
                    autoFocus
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.value}
                    onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-2 py-1 text-sm border border-border rounded"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.target}
                    onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-2 py-1 text-sm border border-border rounded"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={handleSaveNew}
                      disabled={!editForm.date || !editForm.value}
                      className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Add data points for different time periods (years, quarters, or months) to visualize trends.
      </p>
    </div>
  );
}
