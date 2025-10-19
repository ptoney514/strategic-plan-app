import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MetricsService } from '../lib/services';
import type { Metric, TimeSeriesDataPoint, ChartType } from '../lib/types';
import { Loader2, HelpCircle } from 'lucide-react';
import { TimeSeriesDataEntry } from './TimeSeriesDataEntry';
import { ChartTypePicker } from './ChartTypePicker';

const metricSchema = z.object({
  metric_name: z.string().min(1, 'Metric name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  baseline_value: z.number().min(0, 'Baseline must be positive'),
  current_value: z.number().min(0, 'Current value must be positive'),
  target_value: z.number().min(0, 'Target must be positive'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  data_source: z.string().optional(),
});

type MetricFormData = z.infer<typeof metricSchema>;

interface MetricFormProps {
  metric?: Metric | null;
  goalId: string;
  districtId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MetricForm({
  metric,
  goalId,
  districtId,
  onSuccess,
  onCancel
}: MetricFormProps) {
  const queryClient = useQueryClient();
  const [dataPoints, setDataPoints] = useState<TimeSeriesDataPoint[]>(
    (metric?.data_points as TimeSeriesDataPoint[]) || []
  );
  const [chartType, setChartType] = useState<ChartType | undefined>(metric?.chart_type);
  const [showMeasureHelp, setShowMeasureHelp] = useState(false);

  const createMetric = useMutation({
    mutationFn: (data: Partial<Metric>) => MetricsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', goalId] });
      queryClient.invalidateQueries({ queryKey: ['metrics', 'district', districtId] });
    },
  });

  const updateMetric = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Metric> }) => 
      MetricsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      metric_name: metric?.metric_name || '',
      description: metric?.description || '',
      unit: metric?.unit || '',
      baseline_value: metric?.baseline_value || 0,
      current_value: metric?.current_value || 0,
      target_value: metric?.target_value || 100,
      frequency: metric?.frequency || 'monthly',
      data_source: metric?.data_source || '',
    },
  });

  const onSubmit = async (data: MetricFormData) => {
    try {
      const metricData = {
        ...data,
        data_points: dataPoints.length > 0 ? dataPoints : undefined,
        chart_type: chartType
      };

      if (metric) {
        await updateMetric.mutateAsync({
          id: metric.id,
          updates: metricData
        });
      } else {
        await createMetric.mutateAsync({
          ...metricData,
          goal_id: goalId,
          district_id: districtId,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving metric:', error);
      setError('root', {
        message: 'Failed to save metric. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="metric_name" className="block text-sm font-medium text-foreground mb-1">
            Metric Name *
          </label>
          <input
            type="text"
            id="metric_name"
            {...register('metric_name')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Student Graduation Rate"
          />
          {errors.metric_name && (
            <p className="mt-1 text-sm text-red-600">{errors.metric_name.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="description" className="block text-sm font-medium text-foreground">
              Measure
            </label>
            <button
              type="button"
              onClick={() => setShowMeasureHelp(!showMeasureHelp)}
              className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {showMeasureHelp ? 'Hide' : 'Show'} Examples
            </button>
          </div>
          <textarea
            id="description"
            {...register('description')}
            rows={showMeasureHelp ? 2 : 3}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What are you measuring? (e.g., Teacher Self-Assessment Survey - 1-5 scale - Average instructional model score)"
          />
          {showMeasureHelp && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs space-y-1.5">
              <p className="font-medium text-blue-900">Format: [Data Source] - [Scale/Type] - [Description]</p>
              <div className="space-y-1 text-blue-800">
                <p>• Teacher Self-Assessment Survey - 1-5 scale (5 high) - Average instructional model score</p>
                <p>• Student Belonging Survey - Likert 1-5 - Overall belonging score</p>
                <p>• State Testing - Percent - Higher or lower than state average</p>
                <p>• Enrollment Data - Ratio - Proportion of students in Honors/AP courses</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-foreground mb-1">
            Unit of Measurement *
          </label>
          <input
            type="text"
            id="unit"
            {...register('unit')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., %, count, days"
          />
          {errors.unit && (
            <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-foreground mb-1">
            Measurement Frequency *
          </label>
          <select
            id="frequency"
            {...register('frequency')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label htmlFor="baseline_value" className="block text-sm font-medium text-foreground mb-1">
            Baseline Value *
          </label>
          <input
            type="number"
            id="baseline_value"
            step="0.01"
            {...register('baseline_value', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Starting value"
          />
          {errors.baseline_value && (
            <p className="mt-1 text-sm text-red-600">{errors.baseline_value.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="current_value" className="block text-sm font-medium text-foreground mb-1">
            Current Value *
          </label>
          <input
            type="number"
            id="current_value"
            step="0.01"
            {...register('current_value', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Current value"
          />
          {errors.current_value && (
            <p className="mt-1 text-sm text-red-600">{errors.current_value.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="target_value" className="block text-sm font-medium text-foreground mb-1">
            Target Value *
          </label>
          <input
            type="number"
            id="target_value"
            step="0.01"
            {...register('target_value', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Goal value"
          />
          {errors.target_value && (
            <p className="mt-1 text-sm text-red-600">{errors.target_value.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="data_source" className="block text-sm font-medium text-foreground mb-1">
            Data Source
          </label>
          <input
            type="text"
            id="data_source"
            {...register('data_source')}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Where this data comes from"
          />
        </div>
      </div>

      {/* Chart Type Selection */}
      <div className="pt-4 border-t border-border">
        <ChartTypePicker value={chartType} onChange={setChartType} />
      </div>

      {/* Time-Series Data Entry */}
      {chartType && (
        <div className="pt-4 border-t border-border">
          <TimeSeriesDataEntry
            dataPoints={dataPoints}
            onChange={setDataPoints}
          />
        </div>
      )}

      {/* Progress Preview */}
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Progress Preview</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {(() => {
                const values = handleSubmit((data) => data)();
                if (values && typeof values === 'object' && 'target_value' in values) {
                  const target = (values as any).target_value;
                  const current = (values as any).current_value;
                  const baseline = (values as any).baseline_value;
                  if (target && target !== baseline) {
                    return Math.round(((current - baseline) / (target - baseline)) * 100) + '%';
                  }
                }
                return '0%';
              })()}
            </span>
          </div>
        </div>
      </div>

      {errors.root && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || createMetric.isPending || updateMetric.isPending}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {(isSubmitting || createMetric.isPending || updateMetric.isPending) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {metric ? 'Update' : 'Create'} Metric
        </button>
      </div>
    </form>
  );
}