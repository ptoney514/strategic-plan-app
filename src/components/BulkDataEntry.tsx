import React, { useState, useEffect } from 'react';
import { 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Minus
} from 'lucide-react';
import type { Metric, Goal } from '../lib/types';

interface BulkDataEntryProps {
  metrics: Metric[];
  goals: Goal[];
  period: string;
}

interface DataEntry {
  metricId: string;
  currentValue: number | null;
  targetValue: number | null;
  hasChanges: boolean;
  validation: {
    hasWarning: boolean;
    message?: string;
  };
}

export function BulkDataEntry({ metrics, goals, period }: BulkDataEntryProps) {
  const [dataEntries, setDataEntries] = useState<Map<string, DataEntry>>(new Map());
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  useEffect(() => {
    // Initialize data entries from metrics
    const entries = new Map<string, DataEntry>();
    metrics.forEach(metric => {
      entries.set(metric.id, {
        metricId: metric.id,
        currentValue: metric.current_value || null,
        targetValue: metric.target_value || null,
        hasChanges: false,
        validation: { hasWarning: false }
      });
    });
    setDataEntries(entries);
  }, [metrics]);
  
  const handleValueChange = (metricId: string, field: 'currentValue' | 'targetValue', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    
    setDataEntries(prev => {
      const newEntries = new Map(prev);
      const entry = newEntries.get(metricId) || {
        metricId,
        currentValue: null,
        targetValue: null,
        hasChanges: false,
        validation: { hasWarning: false }
      };
      
      entry[field] = numValue;
      entry.hasChanges = true;
      
      // Validate the entry
      entry.validation = validateEntry(entry, metrics.find(m => m.id === metricId));
      
      newEntries.set(metricId, entry);
      return newEntries;
    });
    
    setUnsavedChanges(true);
  };
  
  const validateEntry = (entry: DataEntry, metric?: Metric) => {
    if (!metric) return { hasWarning: false };
    
    // Check for significant variance
    if (entry.currentValue && metric.current_value) {
      const variance = Math.abs(
        ((entry.currentValue - metric.current_value) / metric.current_value) * 100
      );
      if (variance > 20) {
        return {
          hasWarning: true,
          message: `Value changed by ${variance.toFixed(0)}% from previous`
        };
      }
    }
    
    // Check if current exceeds target significantly
    if (entry.currentValue && entry.targetValue) {
      const performance = (entry.currentValue / entry.targetValue) * 100;
      if (performance > 150) {
        return {
          hasWarning: true,
          message: 'Current value significantly exceeds target'
        };
      }
    }
    
    return { hasWarning: false };
  };
  
  const getProgressColor = (current?: number | null, target?: number | null) => {
    if (!current || !target) return 'text-gray-500';
    const percentage = (current / target) * 100;
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getTrendIcon = (metric: Metric) => {
    if (!metric.ytd_change) return <Minus className="h-4 w-4 text-gray-400" />;
    if (metric.ytd_change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };
  
  const handleSaveAll = async () => {
    // TODO: Implement actual save logic
    console.log('Saving all changes:', Array.from(dataEntries.values()).filter(e => e.hasChanges));
    setUnsavedChanges(false);
  };
  
  // Group metrics by goal
  const metricsByGoal = metrics.reduce((acc, metric) => {
    const goalId = metric.goal_id;
    if (!acc[goalId]) acc[goalId] = [];
    acc[goalId].push(metric);
    return acc;
  }, {} as Record<string, Metric[]>);
  
  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">
            Period: {period === 'current' ? 'Current' : period}
          </span>
          {unsavedChanges && (
            <span className="text-sm text-yellow-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Unsaved changes
            </span>
          )}
        </div>
        <button
          onClick={handleSaveAll}
          disabled={!unsavedChanges}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>
      
      {/* Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="text-left py-3 px-4 font-medium text-sm sticky left-0 bg-muted/20">
                Metric
              </th>
              <th className="text-center py-3 px-4 font-medium text-sm w-32">
                Previous
              </th>
              <th className="text-center py-3 px-4 font-medium text-sm w-32">
                Current
              </th>
              <th className="text-center py-3 px-4 font-medium text-sm w-32">
                Target
              </th>
              <th className="text-center py-3 px-4 font-medium text-sm w-24">
                Progress
              </th>
              <th className="text-center py-3 px-4 font-medium text-sm w-24">
                YTD
              </th>
              <th className="text-center py-3 px-4 font-medium text-sm w-32">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(metricsByGoal).map(([goalId, goalMetrics]) => {
              const goal = goals.find(g => g.id === goalId);
              return (
                <React.Fragment key={goalId}>
                  {/* Goal Header Row */}
                  <tr className="bg-muted/10">
                    <td colSpan={7} className="px-4 py-2 font-medium text-sm">
                      {goal?.goal_number} {goal?.title}
                    </td>
                  </tr>
                  
                  {/* Metric Rows */}
                  {goalMetrics.map(metric => {
                    const entry = dataEntries.get(metric.id);
                    const currentValue = entry?.currentValue ?? metric.current_value;
                    const targetValue = entry?.targetValue ?? metric.target_value;
                    const progress = currentValue && targetValue 
                      ? (currentValue / targetValue * 100).toFixed(1)
                      : null;
                    
                    return (
                      <tr 
                        key={metric.id}
                        className="border-b hover:bg-muted/5 group"
                      >
                        <td className="py-2 px-4 sticky left-0 bg-background">
                          <div>
                            <p className="font-medium text-sm">
                              {metric.name || metric.metric_name}
                            </p>
                            {metric.unit && (
                              <p className="text-xs text-muted-foreground">
                                Unit: {metric.unit}
                              </p>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-2 px-4 text-center">
                          <span className="text-sm text-muted-foreground">
                            {metric.current_value || '—'}
                          </span>
                        </td>
                        
                        <td className="py-2 px-4">
                          <div className="relative">
                            <input
                              type="number"
                              value={entry?.currentValue ?? ''}
                              onChange={(e) => handleValueChange(metric.id, 'currentValue', e.target.value)}
                              placeholder={metric.current_value?.toString() || '—'}
                              className={`w-full px-2 py-1 text-sm text-center border rounded ${
                                entry?.hasChanges 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border'
                              } ${
                                entry?.validation.hasWarning 
                                  ? 'border-yellow-500' 
                                  : ''
                              }`}
                            />
                            {entry?.validation.hasWarning && (
                              <AlertTriangle className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            value={entry?.targetValue ?? ''}
                            onChange={(e) => handleValueChange(metric.id, 'targetValue', e.target.value)}
                            placeholder={metric.target_value?.toString() || '—'}
                            className={`w-full px-2 py-1 text-sm text-center border rounded ${
                              entry?.hasChanges 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border'
                            }`}
                          />
                        </td>
                        
                        <td className="py-2 px-4 text-center">
                          {progress && (
                            <span className={`text-sm font-medium ${getProgressColor(currentValue, targetValue)}`}>
                              {progress}%
                            </span>
                          )}
                        </td>
                        
                        <td className="py-2 px-4">
                          <div className="flex items-center justify-center space-x-1">
                            {getTrendIcon(metric)}
                            <span className="text-sm">
                              {metric.ytd_change 
                                ? `${metric.ytd_change > 0 ? '+' : ''}${metric.ytd_change.toFixed(1)}`
                                : '—'
                              }
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-2 px-4">
                          <div className="flex items-center justify-center">
                            {currentValue && targetValue && (
                              currentValue >= targetValue * 0.95 ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : currentValue >= targetValue * 0.8 ? (
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Validation Summary */}
      {Array.from(dataEntries.values()).some(e => e.validation.hasWarning) && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Data Validation Warnings:
          </p>
          <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            {Array.from(dataEntries.values())
              .filter(e => e.validation.hasWarning)
              .map(e => {
                const metric = metrics.find(m => m.id === e.metricId);
                return (
                  <li key={e.metricId}>
                    • {metric?.name}: {e.validation.message}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}