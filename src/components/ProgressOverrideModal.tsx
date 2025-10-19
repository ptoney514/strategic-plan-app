import React, { useState, useEffect } from 'react';
import type { Goal } from '../lib/types';
import {
  getProgressQualitativeLabel,
  getProgressScoreOutOf5,
  getProgressColor
} from '../lib/types';

interface ProgressOverrideModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onSave: (overrideValue: number | null, displayMode: string, reason: string) => Promise<void>;
}

export function ProgressOverrideModal({
  goal,
  isOpen,
  onClose,
  onSave
}: ProgressOverrideModalProps) {
  const [overrideValue, setOverrideValue] = useState<number>(
    goal.overall_progress_override ?? goal.overall_progress ?? 0
  );
  const [displayMode, setDisplayMode] = useState<string>(
    goal.overall_progress_display_mode || 'percentage'
  );
  const [reason, setReason] = useState<string>(
    goal.overall_progress_override_reason || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when goal changes
  useEffect(() => {
    setOverrideValue(goal.overall_progress_override ?? goal.overall_progress ?? 0);
    setDisplayMode(goal.overall_progress_display_mode || 'percentage');
    setReason(goal.overall_progress_override_reason || '');
    setError('');
  }, [goal]);

  if (!isOpen) return null;

  const handleSave = async () => {
    // Validate reason (required if setting override)
    if (reason.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters)');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(overrideValue, displayMode, reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save override');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    setError('');

    try {
      await onSave(null, displayMode, '');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear override');
    } finally {
      setIsSaving(false);
    }
  };

  const progressColor = getProgressColor(overrideValue);

  // Preview content based on display mode
  const renderPreview = () => {
    switch (displayMode) {
      case 'percentage':
        return `${Math.round(overrideValue)}%`;
      case 'qualitative':
        return getProgressQualitativeLabel(overrideValue);
      case 'score':
        return `${getProgressScoreOutOf5(overrideValue)}/5.00`;
      case 'color-only':
        return '(Color bar only)';
      case 'hidden':
        return '(Hidden)';
      default:
        return `${Math.round(overrideValue)}%`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-border animate-slideUp">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">
              Override Progress
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {goal.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Current Calculated Progress */}
        <div className="mb-6 p-3 bg-secondary rounded-md">
          <p className="text-xs text-muted-foreground mb-1">Current Calculated Progress</p>
          <p className="text-lg font-semibold text-card-foreground">
            {goal.overall_progress != null ? `${Math.round(goal.overall_progress)}%` : 'No data'}
          </p>
        </div>

        {/* Override Value Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Override Value
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={overrideValue}
              onChange={(e) => setOverrideValue(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={overrideValue}
              onChange={(e) => setOverrideValue(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-border rounded text-center"
            />
          </div>
        </div>

        {/* Display Mode Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Display Mode
          </label>
          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded bg-background text-card-foreground"
          >
            <option value="percentage">Percentage (75%)</option>
            <option value="qualitative">Qualitative (Great, Good, etc.)</option>
            <option value="score">Score (3.75/5.00)</option>
            <option value="color-only">Color Bar Only</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {/* Preview */}
        <div className="mb-6 p-4 border border-border rounded-lg bg-background">
          <p className="text-xs text-muted-foreground mb-3">Preview</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${overrideValue}%`,
                  backgroundColor: progressColor
                }}
              />
            </div>
            {displayMode !== 'color-only' && displayMode !== 'hidden' && (
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: progressColor }}
              >
                {renderPreview()}
              </span>
            )}
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Reason for Override *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you're manually overriding the calculated progress..."
            rows={3}
            className="w-full px-3 py-2 border border-border rounded bg-background text-card-foreground resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reason.trim().length}/10 characters minimum
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            disabled={isSaving || !goal.overall_progress_override}
            className="px-4 py-2 border border-border rounded hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Override
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-border rounded hover:bg-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Override'}
          </button>
        </div>
      </div>
    </div>
  );
}
