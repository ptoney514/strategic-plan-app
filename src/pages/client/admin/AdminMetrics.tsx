import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BulkDataEntry } from '../../../components/BulkDataEntry';
import { 
  Upload, 
  Download, 
  Save,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';

export function AdminMetrics() {
  const { slug } = useParams();
  const { district } = useDistrict(slug!);
  const { goals } = useGoals(district?.id);
  const { metrics, loading } = useMetrics(district?.id);
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [showBulkEntry, setShowBulkEntry] = useState(true);
  
  const filteredMetrics = metrics?.filter(m => 
    selectedGoal === 'all' || m.goal_id === selectedGoal
  ) || [];
  
  const handleExportTemplate = () => {
    // TODO: Implement CSV export
    console.log('Exporting template...');
  };
  
  const handleImportData = () => {
    // TODO: Implement import modal
    console.log('Opening import modal...');
  };
  
  const handleSaveAll = () => {
    // TODO: Implement save all changes
    console.log('Saving all changes...');
  };
  
  if (loading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading metrics...</div>
        </div>
      
    );
  }
  
  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Metrics Data Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Update metric values and manage time series data
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportTemplate}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Template</span>
            </button>
            <button
              onClick={handleImportData}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </button>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save All</span>
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Goal Filter</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Goals</option>
                {goals?.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.goal_number} {goal.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="current">Current</option>
                <option value="2024-Q4">Q4 2024</option>
                <option value="2024-Q3">Q3 2024</option>
                <option value="2024">Year 2024</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">View Mode</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBulkEntry(true)}
                  className={`px-3 py-2 rounded-md ${
                    showBulkEntry 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setShowBulkEntry(false)}
                  className={`px-3 py-2 rounded-md ${
                    !showBulkEntry 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Entry Interface */}
        {showBulkEntry ? (
          <BulkDataEntry 
            metrics={filteredMetrics}
            goals={goals || []}
            period={selectedPeriod}
          />
        ) : (
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6">
              <div className="space-y-4">
                {filteredMetrics.map(metric => (
                  <div 
                    key={metric.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {metric.name || metric.metric_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {metric.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <div>
                            <label className="text-xs text-muted-foreground">Current</label>
                            <input
                              type="number"
                              defaultValue={metric.current_value}
                              className="block w-24 px-2 py-1 border border-border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Target</label>
                            <input
                              type="number"
                              defaultValue={metric.target_value}
                              className="block w-24 px-2 py-1 border border-border rounded"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {metric.ytd_change ? `${metric.ytd_change > 0 ? '+' : ''}${metric.ytd_change}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Last Updated
                        </p>
                        <p className="text-sm">
                          {metric.last_actual_period || 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Data Validation Warnings */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Data Validation Warnings
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>• 3 metrics have values that exceed historical ranges</li>
                <li>• 2 metrics are missing data for the current period</li>
                <li>• 1 metric shows unusual variance from previous period</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    
  );
}