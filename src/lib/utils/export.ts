import type { Goal, Metric, District } from '../types';

// Export to CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle special characters and commas in values
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

// Export goals to CSV
export function exportGoalsToCSV(goals: Goal[], district: District) {
  const exportData = goals.map(goal => ({
    'Goal Number': goal.goal_number,
    'Title': goal.title,
    'Description': goal.description || '',
    'Level': goal.level === 0 ? 'Objective' : goal.level === 1 ? 'Strategy' : 'Action',
    'Status': goal.status_detail || 'not_started',
    'Priority': goal.priority || 'medium',
    'Owner': goal.owner_name || '',
    'Department': goal.department || '',
    'Start Date': goal.start_date ? new Date(goal.start_date).toLocaleDateString() : '',
    'End Date': goal.end_date ? new Date(goal.end_date).toLocaleDateString() : '',
    'Budget Allocated': goal.budget_allocated || 0,
    'Budget Spent': goal.budget_spent || 0,
    'Last Reviewed': goal.last_reviewed ? new Date(goal.last_reviewed).toLocaleDateString() : '',
    'Created': new Date(goal.created_at).toLocaleDateString(),
  }));

  exportToCSV(exportData, `${district.slug}-goals-${getDateString()}`);
}

// Export metrics to CSV
export function exportMetricsToCSV(metrics: Metric[], district: District) {
  const exportData = metrics.map(metric => ({
    'Metric Name': metric.metric_name || metric.name || '',
    'Measure': metric.description || '',
    'Category': metric.metric_category || 'other',
    'Type': metric.metric_type || 'number',
    'Current Value': metric.current_value || 0,
    'Target Value': metric.target_value || 0,
    'Unit': metric.unit,
    'Progress (%)': metric.target_value ? Math.round((metric.current_value || 0) / metric.target_value * 100) : 0,
    'Status': metric.status || 'no-data',
    'Frequency': metric.frequency || 'monthly',
    'Aggregation': metric.aggregation_method || 'latest',
    'Data Source': metric.data_source || '',
    'Last Collected': metric.last_collected ? new Date(metric.last_collected).toLocaleDateString() : '',
    'Responsible': metric.reporting_responsible || '',
    'Is Primary': metric.is_primary ? 'Yes' : 'No',
    'Created': metric.created_at ? new Date(metric.created_at).toLocaleDateString() : '',
  }));

  exportToCSV(exportData, `${district.slug}-metrics-${getDateString()}`);
}

// Export to Excel-compatible format (actually CSV that Excel can open)
export function exportToExcel(data: any[], filename: string) {
  // For true Excel export, we'd need a library like xlsx
  // For now, we'll create a CSV that Excel can open
  exportToCSV(data, filename);
}

// Export dashboard summary
export function exportDashboardSummary(
  goals: Goal[], 
  metrics: Metric[], 
  district: District,
  stats: any
) {
  const summary = {
    'District': district.name,
    'Export Date': new Date().toLocaleString(),
    'Total Goals': goals.length,
    'Total Metrics': metrics.length,
    'Average Progress': `${stats.averageProgress}%`,
    'Goals On Track': stats.onTrackCount,
    'Goals At Risk': stats.atRiskCount,
    'Goals Critical': stats.criticalCount,
    'Goals Completed': stats.completedCount,
    'Metrics with Data': metrics.filter(m => m.current_value !== null).length,
    'Metrics without Data': metrics.filter(m => m.current_value === null).length,
  };

  const exportData = Object.entries(summary).map(([key, value]) => ({
    'Metric': key,
    'Value': value
  }));

  exportToCSV(exportData, `${district.slug}-summary-${getDateString()}`);
}

// Export to JSON
export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

// Export metrics with time series data
export function exportMetricsWithTimeSeries(
  metrics: any[], 
  district: District
) {
  const exportData: any[] = [];

  metrics.forEach(metric => {
    if (metric.timeSeries && metric.timeSeries.length > 0) {
      metric.timeSeries.forEach((ts: any) => {
        exportData.push({
          'Metric Name': metric.metric_name || metric.name,
          'Period': ts.period,
          'Period Type': ts.period_type,
          'Target Value': ts.target_value || '',
          'Actual Value': ts.actual_value || '',
          'Status': ts.status || '',
          'Notes': ts.notes || '',
        });
      });
    } else {
      exportData.push({
        'Metric Name': metric.metric_name || metric.name,
        'Period': 'Current',
        'Period Type': 'snapshot',
        'Target Value': metric.target_value || '',
        'Actual Value': metric.current_value || '',
        'Status': metric.status || '',
        'Measure': metric.description || '',
      });
    }
  });

  exportToCSV(exportData, `${district.slug}-metrics-timeseries-${getDateString()}`);
}

// Export performance report
export function exportPerformanceReport(
  goals: Goal[],
  metrics: Metric[],
  district: District
) {
  const report: any[] = [];

  goals.forEach(goal => {
    const goalMetrics = metrics.filter(m => m.goal_id === goal.id);
    
    // Calculate goal progress
    let goalProgress = 0;
    if (goalMetrics.length > 0) {
      const validMetrics = goalMetrics.filter(m => 
        m.current_value !== undefined && 
        m.target_value !== undefined && 
        m.target_value > 0
      );
      
      if (validMetrics.length > 0) {
        const progressSum = validMetrics.reduce((sum, metric) => {
          const progress = (metric.current_value! / metric.target_value!) * 100;
          return sum + Math.min(progress, 100);
        }, 0);
        goalProgress = Math.round(progressSum / validMetrics.length);
      }
    }

    report.push({
      'Goal Number': goal.goal_number,
      'Goal Title': goal.title,
      'Level': goal.level === 0 ? 'Objective' : goal.level === 1 ? 'Strategy' : 'Action',
      'Status': goal.status_detail || 'not_started',
      'Progress (%)': goalProgress,
      'Metrics Count': goalMetrics.length,
      'Metrics On Target': goalMetrics.filter(m => m.status === 'on-target').length,
      'Metrics Off Target': goalMetrics.filter(m => m.status === 'off-target').length,
      'Metrics Critical': goalMetrics.filter(m => m.status === 'critical').length,
      'Owner': goal.owner_name || '',
      'Department': goal.department || '',
      'Priority': goal.priority || 'medium',
      'Start Date': goal.start_date ? new Date(goal.start_date).toLocaleDateString() : '',
      'End Date': goal.end_date ? new Date(goal.end_date).toLocaleDateString() : '',
    });
  });

  exportToCSV(report, `${district.slug}-performance-report-${getDateString()}`);
}

// Helper function to download blob
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Helper function to get date string for filenames
function getDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Create a comprehensive export package
export function exportComprehensivePackage(
  goals: Goal[],
  metrics: Metric[],
  district: District,
  stats: any
) {
  // Create multiple exports
  exportDashboardSummary(goals, metrics, district, stats);
  exportGoalsToCSV(goals, district);
  exportMetricsToCSV(metrics, district);
  exportPerformanceReport(goals, metrics, district);
  
  // Also create a JSON backup
  const fullData = {
    district,
    goals,
    metrics,
    stats,
    exportDate: new Date().toISOString(),
  };
  exportToJSON(fullData, `${district.slug}-full-backup-${getDateString()}`);
  
  // Show success message (you might want to integrate with a toast notification system)
  console.log('Export completed successfully');
}