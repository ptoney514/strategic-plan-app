import React, { useState } from 'react';
import { Wrench, X, AlertCircle } from 'lucide-react';
import type { AutoFixSuggestion } from '../../lib/types/import.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

export interface AutoFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AutoFixSuggestion | null;
  suggestions?: AutoFixSuggestion[]; // For bulk mode
  onApply: (suggestion: AutoFixSuggestion, customTitle?: string, customOwner?: string) => Promise<void>;
  onBulkApply?: (suggestions: AutoFixSuggestion[]) => Promise<void>;
  isBulk?: boolean;
}

export const AutoFixModal: React.FC<AutoFixModalProps> = ({
  isOpen,
  onClose,
  suggestion,
  suggestions = [],
  onApply,
  onBulkApply,
  isBulk = false
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customOwner, setCustomOwner] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  React.useEffect(() => {
    if (suggestion) {
      setCustomTitle(suggestion.suggestedTitle || '');
      setCustomOwner(suggestion.suggestedOwner || '');
    }
  }, [suggestion]);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (isBulk && onBulkApply && suggestions.length > 0) {
      setIsApplying(true);
      try {
        await onBulkApply(suggestions);
        onClose();
      } catch (error) {
        console.error('Error applying bulk fix:', error);
      } finally {
        setIsApplying(false);
      }
    } else if (suggestion) {
      setIsApplying(true);
      try {
        await onApply(suggestion, customTitle, customOwner);
        onClose();
      } catch (error) {
        console.error('Error applying fix:', error);
      } finally {
        setIsApplying(false);
      }
    }
  };

  const levelLabel = suggestion?.suggestedLevel === 0 ? 'Strategic Objective' :
                     suggestion?.suggestedLevel === 1 ? 'Goal' : 'Goal';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {isBulk ? 'Auto-Fix All Issues' : 'Auto-Fix Missing Parent'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isBulk
                    ? `Create ${suggestions.length} placeholder goal${suggestions.length > 1 ? 's' : ''}`
                    : 'Create a placeholder goal for the missing parent'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {isBulk ? (
              // Bulk mode: Show list of all placeholders that will be created
              <div className="space-y-4">
                <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">The following placeholder goals will be created:</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {suggestions.map((sug, index) => {
                    const label = sug.suggestedLevel === 0 ? 'Goal' :
                                 sug.suggestedLevel === 1 ? 'Strategy' : 'Action';
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 border border-border rounded-lg"
                      >
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                          sug.suggestedLevel === 0
                            ? 'bg-purple-100 text-purple-700'
                            : sug.suggestedLevel === 1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-medium text-foreground">
                            {sug.missingGoalNumber}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {sug.suggestedTitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  Note: You can rename these placeholders after they are created in the review table.
                </p>
              </div>
            ) : (
              // Single mode: Show editable form
              suggestion && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Missing Parent Detected</p>
                      <p className="mt-1">
                        Goal <span className="font-mono">{suggestion.missingGoalNumber}</span> is required
                        but not found in your import or database.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Goal Number</Label>
                        <p className="font-mono text-sm font-medium text-foreground mt-1">
                          {suggestion.missingGoalNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Level</Label>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-1 ${
                          suggestion.suggestedLevel === 0
                            ? 'bg-purple-100 text-purple-700'
                            : suggestion.suggestedLevel === 1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {levelLabel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Enter goal title"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can update this now or edit it later in the review table
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="owner">Owner (Optional)</Label>
                      <Input
                        id="owner"
                        value={customOwner}
                        onChange={(e) => setCustomOwner(e.target.value)}
                        placeholder="Enter owner name"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      ✓ This will create a placeholder goal that you can refine before importing
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={isApplying || (!isBulk && !customTitle.trim())}
            >
              {isApplying
                ? 'Creating...'
                : isBulk
                ? `Create ${suggestions.length} Placeholder${suggestions.length > 1 ? 's' : ''}`
                : 'Create Placeholder'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
