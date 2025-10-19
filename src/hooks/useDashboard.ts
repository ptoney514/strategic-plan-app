import { useQuery, useQueries } from '@tanstack/react-query';
import { GoalsService, MetricsService, DistrictService } from '../lib/services';
import { MetricTimeSeriesService } from '../lib/services/metricTimeSeries.service';
import type { Goal, Metric, MetricTimeSeries, District } from '../lib/types';

interface DashboardData {
  district: District;
  goals: Goal[];
  metrics: Metric[];
  timeSeries: MetricTimeSeries[];
  stats: {
    totalGoals: number;
    totalMetrics: number;
    averageProgress: number;
    onTrackCount: number;
    atRiskCount: number;
    criticalCount: number;
    completedCount: number;
  };
}

// Hook for fetching all dashboard data
export function useDashboardData(districtId: string) {
  return useQuery({
    queryKey: ['dashboard', districtId],
    queryFn: async (): Promise<DashboardData> => {
      // Fetch all data in parallel
      const [district, goals, metrics] = await Promise.all([
        DistrictService.getById(districtId),
        GoalsService.getByDistrict(districtId),
        MetricsService.getByDistrict(districtId),
      ]);

      // Fetch time series data for all metrics
      const timeSeriesPromises = metrics.map(m => 
        MetricTimeSeriesService.getByMetric(m.id).catch(() => [])
      );
      const timeSeriesResults = await Promise.all(timeSeriesPromises);
      const timeSeries = timeSeriesResults.flat();

      // Calculate statistics
      const stats = calculateDashboardStats(goals, metrics);

      return {
        district,
        goals,
        metrics,
        timeSeries,
        stats,
      };
    },
    enabled: !!districtId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching metrics with time series data
export function useMetricsWithTimeSeries(districtId: string) {
  return useQuery({
    queryKey: ['metrics-with-timeseries', districtId],
    queryFn: async () => {
      const metrics = await MetricsService.getByDistrict(districtId);
      
      // Fetch time series for each metric
      const metricsWithTimeSeries = await Promise.all(
        metrics.map(async (metric) => {
          const timeSeries = await MetricTimeSeriesService.getByMetric(metric.id).catch(() => []);
          return {
            ...metric,
            timeSeries,
          };
        })
      );

      return metricsWithTimeSeries;
    },
    enabled: !!districtId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Hook for fetching aggregated metrics by category
export function useMetricsByCategory(districtId: string) {
  return useQuery({
    queryKey: ['metrics-by-category', districtId],
    queryFn: async () => {
      const metrics = await MetricsService.getByDistrict(districtId);
      
      // Group metrics by category
      const byCategory = metrics.reduce((acc, metric) => {
        const category = metric.metric_category || 'other';
        if (!acc[category]) {
          acc[category] = {
            category,
            metrics: [],
            averageProgress: 0,
            totalTarget: 0,
            totalActual: 0,
          };
        }
        
        acc[category].metrics.push(metric);
        
        if (metric.target_value && metric.current_value) {
          acc[category].totalTarget += metric.target_value;
          acc[category].totalActual += metric.current_value;
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate averages
      Object.values(byCategory).forEach((cat: any) => {
        if (cat.totalTarget > 0) {
          cat.averageProgress = Math.round((cat.totalActual / cat.totalTarget) * 100);
        }
      });

      return Object.values(byCategory);
    },
    enabled: !!districtId,
  });
}

// Hook for real-time metrics updates (polling)
export function useRealtimeMetrics(districtId: string, pollingInterval = 30000) {
  return useQuery({
    queryKey: ['realtime-metrics', districtId],
    queryFn: () => MetricsService.getByDistrict(districtId),
    enabled: !!districtId,
    refetchInterval: pollingInterval, // Poll every 30 seconds by default
    refetchIntervalInBackground: true,
  });
}

// Hook for fetching performance trends
export function usePerformanceTrends(districtId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
  return useQuery({
    queryKey: ['performance-trends', districtId, period],
    queryFn: async () => {
      const metrics = await MetricsService.getByDistrict(districtId);
      const goals = await GoalsService.getByDistrict(districtId);
      
      // Calculate trend data based on period
      const trends = calculateTrends(metrics, goals, period);
      
      return trends;
    },
    enabled: !!districtId,
  });
}

// Helper function to calculate dashboard statistics
function calculateDashboardStats(goals: Goal[], metrics: Metric[]) {
  const totalGoals = goals.length;
  const totalMetrics = metrics.length;
  
  let totalProgress = 0;
  let onTrackCount = 0;
  let atRiskCount = 0;
  let criticalCount = 0;
  let completedCount = 0;

  goals.forEach(goal => {
    // Calculate progress for each goal
    const goalMetrics = metrics.filter(m => m.goal_id === goal.id);
    let progress = 0;
    
    if (goalMetrics.length > 0) {
      const validMetrics = goalMetrics.filter(m => 
        m.current_value !== undefined && 
        m.target_value !== undefined && 
        m.target_value > 0
      );
      
      if (validMetrics.length > 0) {
        const progressSum = validMetrics.reduce((sum, metric) => {
          const metricProgress = (metric.current_value! / metric.target_value!) * 100;
          return sum + Math.min(metricProgress, 100);
        }, 0);
        progress = progressSum / validMetrics.length;
      }
    }
    
    totalProgress += progress;
    
    // Categorize by status
    if (progress >= 100) {
      completedCount++;
    } else if (progress >= 70) {
      onTrackCount++;
    } else if (progress >= 40) {
      atRiskCount++;
    } else {
      criticalCount++;
    }
  });

  const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;

  return {
    totalGoals,
    totalMetrics,
    averageProgress,
    onTrackCount,
    atRiskCount,
    criticalCount,
    completedCount,
  };
}

// Helper function to calculate trends
function calculateTrends(metrics: Metric[], goals: Goal[], period: string) {
  // This would calculate actual trends based on historical data
  // For now, returning mock trend data structure
  const now = new Date();
  const periods = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    if (period === 'week') {
      date.setDate(date.getDate() - (i * 7));
    } else if (period === 'month') {
      date.setMonth(date.getMonth() - i);
    } else if (period === 'quarter') {
      date.setMonth(date.getMonth() - (i * 3));
    } else {
      date.setFullYear(date.getFullYear() - i);
    }
    
    periods.push({
      date: date.toISOString().split('T')[0],
      goalsProgress: Math.random() * 100,
      metricsAchieved: Math.floor(Math.random() * metrics.length),
      totalValue: Math.random() * 10000,
    });
  }
  
  return {
    periods,
    summary: {
      trend: 'improving' as const,
      changePercent: 15.5,
      projection: 'on-track',
    },
  };
}

// Hook for batch fetching multiple districts (for multi-district view)
export function useMultiDistrictDashboard(districtIds: string[]) {
  return useQueries({
    queries: districtIds.map(id => ({
      queryKey: ['district-summary', id],
      queryFn: async () => {
        const [district, goals, metrics] = await Promise.all([
          DistrictService.getById(id),
          GoalsService.getByDistrict(id),
          MetricsService.getByDistrict(id),
        ]);
        
        const stats = calculateDashboardStats(goals, metrics);
        
        return {
          district,
          ...stats,
        };
      },
      enabled: !!id,
    })),
  });
}