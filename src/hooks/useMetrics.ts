import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetricsService, MetricTimeSeriesService } from '../lib/services';
import type { Metric, MetricTimeSeries } from '../lib/types';

export function useMetrics(goalId: string) {
  return useQuery({
    queryKey: ['metrics', goalId],
    queryFn: () => MetricsService.getByGoal(goalId),
    enabled: !!goalId,
  });
}

export function useMetricsByDistrict(districtId: string) {
  return useQuery({
    queryKey: ['metrics', 'district', districtId],
    queryFn: () => MetricsService.getByDistrict(districtId),
    enabled: !!districtId,
  });
}

export function useMetric(id: string) {
  return useQuery({
    queryKey: ['metrics', 'single', id],
    queryFn: () => MetricsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (metric: Partial<Metric>) => MetricsService.create(metric),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['metrics', data.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['metrics', 'district'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Metric> }) =>
      MetricsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['metrics', data.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['metrics', 'district'] });
      queryClient.invalidateQueries({ queryKey: ['metrics', 'single', data.id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useUpdateMetricValue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) => 
      MetricsService.updateValue(id, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['metrics', data.goal_id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDeleteMetric() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => MetricsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useBulkUpdateMetrics() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (metrics: Partial<Metric>[]) => MetricsService.bulkUpdate(metrics),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useReorderMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (metrics: { id: string; display_order: number }[]) =>
      MetricsService.reorder(metrics),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}

// Time series hooks
export function useMetricTimeSeries(metricId: string) {
  return useQuery({
    queryKey: ['metric-time-series', metricId],
    queryFn: () => MetricTimeSeriesService.getByMetricId(metricId),
    enabled: !!metricId,
  });
}

export function useMetricChartData(metricId: string, limit: number = 12) {
  return useQuery({
    queryKey: ['metric-chart-data', metricId, limit],
    queryFn: () => MetricTimeSeriesService.getChartData(metricId, undefined, limit),
    enabled: !!metricId,
  });
}