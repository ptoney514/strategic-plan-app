import { useState, useEffect } from 'react';
import { X, Layers, TrendingUp, Check } from 'lucide-react';
import type { Goal } from '../../lib/types';

interface HeaderEditFormProps {
  objective: Goal;
  onSave: (updates: Partial<Goal>) => Promise<void>;
  onCancel: () => void;
}

const colorPresets = [
  { hex: '#22c55e', name: 'green' },
  { hex: '#f59e0b', name: 'amber' },
  { hex: '#ef4444', name: 'red' },
  { hex: '#3b82f6', name: 'blue' },
  { hex: '#8b5cf6', name: 'purple' },
  { hex: '#6b7280', name: 'gray' },
];

export function HeaderEditForm({ objective, onSave, onCancel }: HeaderEditFormProps) {
  // Form state
  const [title, setTitle] = useState(objective.title || '');
  const [description, setDescription] = useState(objective.description || '');
  const [showVisualBadge, setShowVisualBadge] = useState(!!objective.indicator_text);
  const [badgeType, setBadgeType] = useState<'on-target' | 'needs-attention' | 'off-target'>('on-target');
  const [customBadgeText, setCustomBadgeText] = useState(objective.indicator_text || 'On Target');
  const [badgeColor, setBadgeColor] = useState(objective.indicator_color || '#22c55e');
  const [showProgressBar, setShowProgressBar] = useState(objective.show_progress_bar ?? true);

  // Validation state
  const [errors, setErrors] = useState<{ title?: string; badgeText?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Detect badge type from existing text
  useEffect(() => {
    if (objective.indicator_text) {
      const text = objective.indicator_text.toLowerCase();
      if (text.includes('on target')) {
        setBadgeType('on-target');
      } else if (text.includes('needs attention')) {
        setBadgeType('needs-attention');
      } else if (text.includes('off target')) {
        setBadgeType('off-target');
      }
    }
  }, [objective.indicator_text]);

  const handleBadgeTypeChange = (type: 'on-target' | 'needs-attention' | 'off-target') => {
    setBadgeType(type);
    if (type === 'on-target') {
      setCustomBadgeText('On Target');
      setBadgeColor('#22c55e');
    } else if (type === 'needs-attention') {
      setCustomBadgeText('Needs Attention');
      setBadgeColor('#f59e0b');
    } else {
      setCustomBadgeText('Off Target');
      setBadgeColor('#ef4444');
    }
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; badgeText?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (showVisualBadge && !customBadgeText.trim()) {
      newErrors.badgeText = 'Badge text is required when visual badge is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        indicator_text: showVisualBadge ? customBadgeText : undefined,
        indicator_color: showVisualBadge ? badgeColor : undefined,
        show_progress_bar: showProgressBar,
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#f5f3ef] border-2 border-[#e8e6e1] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[17px] font-bold text-[#1a1a1a]">Edit Header</h2>
        <button
          onClick={onCancel}
          className="p-1 rounded hover:bg-[#e8e6e1] transition-colors"
          type="button"
        >
          <X className="h-5 w-5 text-[#6a6a6a]" />
        </button>
      </div>

      {/* Title Field */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
          Title <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Student Achievement & Well-being"
          className={`w-full px-4 py-3 text-[14px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
            errors.title
              ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
              : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-[12px] text-[#ef4444]">{errors.title}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-[#1a1a1a] mb-2">
          Description <span className="text-[#6a6a6a] font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          placeholder="Brief description of the objective..."
          rows={3}
          className="w-full px-4 py-3 text-[14px] border border-[#e8e6e1] rounded-lg bg-white focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#d1fae5] transition-colors resize-none"
        />
        <div className="text-right text-[12px] text-[#8a8a8a] mt-1">
          {description.length} / 1000 characters
        </div>
      </div>

      {/* Visual Badge Section */}
      <div className="mb-4 pb-4 border-b border-[#e8e6e1]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#10b981]" />
            <span className="text-[13px] font-semibold text-[#1a1a1a]">Visual Badge</span>
          </div>
          <button
            onClick={() => setShowVisualBadge(!showVisualBadge)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              showVisualBadge ? 'bg-[#10b981]' : 'bg-[#d4d1cb]'
            }`}
            type="button"
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                showVisualBadge ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {showVisualBadge && (
          <>
            {/* Badge Type Selection */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(['on-target', 'needs-attention', 'off-target'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleBadgeTypeChange(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-[11px] font-semibold transition-all ${
                    badgeType === type
                      ? type === 'on-target'
                        ? 'bg-[#d1fae5] text-[#059669] border-[#10b981]'
                        : type === 'needs-attention'
                        ? 'bg-[#fef3c7] text-[#b45309] border-[#f59e0b]'
                        : 'bg-[#fee2e2] text-[#dc2626] border-[#ef4444]'
                      : 'bg-white border-[#e8e6e1] text-[#6a6a6a] hover:bg-[#fafaf8]'
                  }`}
                  type="button"
                >
                  {badgeType === type && <Check className="h-3 w-3" />}
                  {type === 'on-target' && 'On Target'}
                  {type === 'needs-attention' && 'Needs Attention'}
                  {type === 'off-target' && 'Off Target'}
                </button>
              ))}
            </div>

            {/* Custom Badge Text & Color */}
            <div className="mb-3">
              <label className="block text-[12px] text-[#6a6a6a] mb-1.5">Custom Badge Text</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBadgeText}
                  onChange={(e) => setCustomBadgeText(e.target.value)}
                  className={`flex-1 px-3 py-2 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 transition-colors ${
                    errors.badgeText
                      ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]'
                      : 'border-[#e8e6e1] focus:border-[#10b981] focus:ring-[#d1fae5]'
                  }`}
                />
                <div className="flex gap-1 p-1 border border-[#e8e6e1] rounded-lg bg-white">
                  {colorPresets.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setBadgeColor(color.hex)}
                      className={`w-6 h-6 rounded ${
                        badgeColor === color.hex ? 'ring-2 ring-offset-1 ring-[#1a1a1a]' : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      type="button"
                    />
                  ))}
                </div>
              </div>
              {errors.badgeText && (
                <p className="mt-1 text-[12px] text-[#ef4444]">{errors.badgeText}</p>
              )}
            </div>

            {/* Badge Preview */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6a6a6a]">Preview:</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: badgeColor }}
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                {customBadgeText || 'Badge Text'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#10b981]" />
            <div>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">Progress Bar</span>
              <p className="text-[11px] text-[#6a6a6a]">Display an overall progress indicator</p>
            </div>
          </div>
          <button
            onClick={() => setShowProgressBar(!showProgressBar)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              showProgressBar ? 'bg-[#10b981]' : 'bg-[#d4d1cb]'
            }`}
            type="button"
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                showProgressBar ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-[13px] font-semibold text-[#6a6a6a] bg-white border border-[#e8e6e1] rounded-lg hover:bg-gray-50 transition-colors"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 text-[13px] font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          type="button"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
}
