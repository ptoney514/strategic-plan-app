import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import type { Goal } from '../lib/types';

interface StatusManagerProps {
  goal: Goal;
  onClose: () => void;
  onSave: (status: string, reason: string) => void;
}

export function StatusManager({ goal, onClose, onSave }: StatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(goal.status || 'not-started');
  const [overrideReason, setOverrideReason] = useState('');
  const [reasonCategory, setReasonCategory] = useState('contextual');
  
  const statusOptions = [
    { 
      value: 'on-target', 
      label: 'On Target', 
      icon: CheckCircle, 
      color: 'text-green-600',
      description: 'Goal is meeting or exceeding expectations'
    },
    { 
      value: 'at-risk', 
      label: 'At Risk', 
      icon: AlertCircle, 
      color: 'text-yellow-600',
      description: 'Goal needs attention but can be recovered'
    },
    { 
      value: 'critical', 
      label: 'Critical', 
      icon: XCircle, 
      color: 'text-red-600',
      description: 'Goal is significantly off track'
    },
    { 
      value: 'off-target', 
      label: 'Off Target', 
      icon: XCircle, 
      color: 'text-orange-600',
      description: 'Goal is not meeting targets'
    },
    { 
      value: 'not-started', 
      label: 'Not Started', 
      icon: Clock, 
      color: 'text-gray-600',
      description: 'Goal has not been initiated yet'
    }
  ];
  
  const reasonCategories = [
    { value: 'strategic', label: 'Strategic Decision' },
    { value: 'contextual', label: 'Contextual Factors' },
    { value: 'external_factors', label: 'External Factors' },
    { value: 'data_quality', label: 'Data Quality Issues' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleSave = () => {
    if (selectedStatus !== goal.calculated_status && !overrideReason.trim()) {
      alert('Please provide a reason for the status override');
      return;
    }
    onSave(selectedStatus, overrideReason);
  };
  
  const isOverride = selectedStatus !== goal.calculated_status;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Manage Goal Status</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Goal {goal.goal_number}: {goal.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6">
          {/* System Recommendation */}
          {goal.calculated_status && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">System Recommendation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on current metrics, the calculated status is:{' '}
                    <span className="font-medium">
                      {goal.calculated_status?.replace('-', ' ')}
                    </span>
                  </p>
                  {goal.status_calculation_confidence && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Confidence: {goal.status_calculation_confidence}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                const isCalculated = option.value === goal.calculated_status;
                
                return (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${option.color}`} />
                        <span className="font-medium">{option.label}</span>
                        {isCalculated && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            System Calculated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* Override Reason (required if overriding) */}
          {isOverride && (
            <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Status Override Justification Required
              </p>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason Category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {reasonCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Detailed Justification
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why you are overriding the calculated status..."
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 50 characters required for audit trail
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isOverride && (
              <p>This override will be logged in the audit trail</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isOverride && overrideReason.trim().length < 50}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}