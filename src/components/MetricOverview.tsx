import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Calendar, BarChart3 } from 'lucide-react';
import type { MetricWithTimeSeries } from '../lib/types';

interface MetricOverviewProps {
  metric: MetricWithTimeSeries;
  onEdit?: () => void;
  onViewDetails?: () => void;
}

export function MetricOverview({ metric, onEdit, onViewDetails }: MetricOverviewProps) {
  // Format the main value based on metric settings
  const formatValue = (value: number | null | undefined): string => {
    if (value == null) return '--';
    
    const formatted = value.toFixed(metric.decimal_places || 2);
    
    if (metric.is_percentage) {
      return `${formatted}%`;
    }
    
    return formatted;
  };

  // Format the period for display
  const formatPeriod = (period: string | null | undefined): string => {
    if (!period) return '';
    
    // Handle quarterly periods
    if (period.includes('-Q')) {
      const [year, quarter] = period.split('-Q');
      return `Q${quarter} ${year}`;
    }
    
    // Handle monthly periods
    if (period.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = period.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    // Annual period
    return period;
  };

  // Determine trend icon based on comparison
  const getTrendIcon = () => {
    if (!metric.ytd_value || !metric.target_value) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    const performance = metric.ytd_value / metric.target_value;
    
    if (metric.is_higher_better) {
      if (performance >= 1) return <TrendingUp className="h-4 w-4 text-green-600" />;
      if (performance >= 0.9) return <Minus className="h-4 w-4 text-yellow-600" />;
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      // For metrics where lower is better
      if (performance <= 1) return <TrendingUp className="h-4 w-4 text-green-600" />;
      if (performance <= 1.1) return <Minus className="h-4 w-4 text-yellow-600" />;
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  // Get status color classes
  const getStatusColor = () => {
    switch (metric.status) {
      case 'on-target':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'off-target':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentValue = metric.current_value || metric.ytd_value;

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground">
            {metric.metric_name}
          </h3>
          {metric.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {metric.description}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor()}`}>
          {metric.status?.replace('-', ' ') || 'no data'}
        </span>
      </div>

      {/* Main Value Display */}
      <div className="bg-secondary/30 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-card-foreground">
            {formatValue(currentValue)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {metric.unit && <span>{metric.unit}</span>}
          </div>
          {metric.last_actual_period && (
            <div className="text-xs text-muted-foreground mt-2">
              as of {formatPeriod(metric.last_actual_period)}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* YTD */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">YTD</span>
          </div>
          <div className="font-semibold text-sm">
            {formatValue(metric.ytd_value)}
          </div>
        </div>

        {/* EOY Projection */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <BarChart3 className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">EOY</span>
          </div>
          <div className="font-semibold text-sm">
            {formatValue(metric.eoy_projection)}
          </div>
        </div>

        {/* Target */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Target</span>
          </div>
          <div className="font-semibold text-sm">
            {formatValue(metric.target_value)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {metric.target_value && currentValue != null && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress to Target</span>
            <span>{Math.round((currentValue / metric.target_value) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min((currentValue / metric.target_value) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className="text-xs text-muted-foreground">
            {metric.frequency} tracking
          </span>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-primary hover:underline"
            >
              Update
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-sm text-primary hover:underline"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}