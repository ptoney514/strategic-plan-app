import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Metric, TimeSeriesDataPoint } from '../lib/types';

interface MetricsChartProps {
  metrics: Metric[];
  variant?: 'line' | 'area' | 'bar';
}

export function MetricsChart({ metrics, variant = 'line' }: MetricsChartProps) {
  // Check if metrics have manual time-series data points
  const hasManualData = metrics.some(m => m.data_points && m.data_points.length > 0);

  let chartData: any[] = [];

  if (hasManualData) {
    // Use manual data points from the metric
    const metric = metrics[0]; // For now, support single metric visualization
    const dataPoints = metric.data_points as TimeSeriesDataPoint[];
    const metricName = metric.name || metric.metric_name;

    chartData = dataPoints.map(point => {
      const data: Record<string, any> = {
        period: point.date,
        value: point.value,
        target: point.target
      };
      if (metricName) {
        data[metricName] = point.value;
      }
      return data;
    });
  } else {
    // Fallback to synthetic data for backward compatibility
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    chartData = months.map(month => {
      const monthData: Record<string, any> = { period: month };
      metrics.forEach(metric => {
        const metricName = metric.name || metric.metric_name;
        const baseValue = metric.baseline_value || 0;
        const currentValue = metric.current_value || 0;
        const monthIndex = months.indexOf(month);
        const progress = monthIndex / (months.length - 1);
        monthData[metricName] = Math.round(baseValue + (currentValue - baseValue) * progress);
        monthData[`${metricName}_target`] = metric.target_value;
      });
      return monthData;
    });
  }

  const colors = [
    'hsl(var(--primary))',
    '#10b981',
    '#f59e0b',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899'
  ];

  if (metrics.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-card border border-border rounded-lg">
        <p className="text-muted-foreground">No metrics data available</p>
      </div>
    );
  }

  // Determine chart components based on variant
  let Chart;
  let DataComponent;

  if (variant === 'bar') {
    Chart = BarChart;
    DataComponent = Bar;
  } else if (variant === 'area') {
    Chart = AreaChart;
    DataComponent = Area;
  } else {
    Chart = LineChart;
    DataComponent = Line;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="period"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: 'hsl(var(--card-foreground))' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '1rem' }}
            iconType={variant === 'area' ? 'rect' : variant === 'bar' ? 'rect' : 'line'}
          />
          {metrics.slice(0, 6).map((metric, index) => {
            const metricName = metric.name || metric.metric_name;
            return (
              <DataComponent
                key={metric.id}
                type={variant === 'bar' ? undefined : 'monotone'}
                dataKey={metricName}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={variant === 'area' ? 0.3 : 1}
                strokeWidth={variant === 'bar' ? 0 : 2}
                dot={variant === 'bar' ? undefined : { r: 3 }}
                activeDot={variant === 'bar' ? undefined : { r: 5 }}
              />
            );
          })}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}