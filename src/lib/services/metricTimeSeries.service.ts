import { supabase } from '../supabase';
import type { MetricTimeSeries, PeriodType, MetricStatus } from '../types';

export class MetricTimeSeriesService {
  /**
   * Get all time series data for a metric
   */
  static async getByMetricId(metricId: string): Promise<MetricTimeSeries[]> {
    const { data, error } = await supabase
      .from('spb_metric_time_series')
      .select('*')
      .eq('metric_id', metricId)
      .order('period', { ascending: true });

    if (error) {
      console.error('Error fetching metric time series:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get time series data for a specific period range
   */
  static async getByPeriodRange(
    metricId: string,
    startPeriod: string,
    endPeriod: string
  ): Promise<MetricTimeSeries[]> {
    const { data, error } = await supabase
      .from('spb_metric_time_series')
      .select('*')
      .eq('metric_id', metricId)
      .gte('period', startPeriod)
      .lte('period', endPeriod)
      .order('period', { ascending: true });

    if (error) {
      console.error('Error fetching metric time series by range:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create or update a time series entry
   */
  static async upsert(entry: Partial<MetricTimeSeries>): Promise<MetricTimeSeries> {
    const { data, error } = await supabase
      .from('spb_metric_time_series')
      .upsert({
        ...entry,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'metric_id,period'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting metric time series:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a time series entry
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('spb_metric_time_series')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting metric time series:', error);
      throw error;
    }
  }

  /**
   * Calculate YTD average for a metric
   */
  static async calculateYTD(metricId: string, year: number = new Date().getFullYear()): Promise<number | null> {
    const { data, error } = await supabase
      .from('spb_metric_time_series')
      .select('actual_value')
      .eq('metric_id', metricId)
      .like('period', `${year}%`)
      .not('actual_value', 'is', null);

    if (error) {
      console.error('Error calculating YTD:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const sum = data.reduce((acc, item) => acc + (item.actual_value || 0), 0);
    return sum / data.length;
  }

  /**
   * Calculate EOY projection based on current trend
   */
  static async calculateEOYProjection(
    metricId: string,
    frequency: 'monthly' | 'quarterly' | 'yearly',
    year: number = new Date().getFullYear()
  ): Promise<number | null> {
    const { data, error } = await supabase
      .from('spb_metric_time_series')
      .select('actual_value, period')
      .eq('metric_id', metricId)
      .like('period', `${year}%`)
      .not('actual_value', 'is', null)
      .order('period', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Calculate average of existing data
    const average = data.reduce((acc, item) => acc + (item.actual_value || 0), 0) / data.length;

    // For simple projection, assume the average continues
    // More sophisticated projections could use trend analysis
    return average;
  }

  /**
   * Get the latest actual value and period
   */
  static async getLatestActual(metricId: string): Promise<{ value: number; period: string } | null> {
    const { data, error } = await supabase
      .from('spb_metric_time_series')
      .select('actual_value, period')
      .eq('metric_id', metricId)
      .not('actual_value', 'is', null)
      .order('period', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      value: data.actual_value,
      period: data.period
    };
  }

  /**
   * Generate period string based on type and date
   */
  static generatePeriod(date: Date, periodType: PeriodType): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed
    const quarter = Math.ceil(month / 3);

    switch (periodType) {
      case 'annual':
        return `${year}`;
      case 'quarterly':
        return `${year}-Q${quarter}`;
      case 'monthly':
        return `${year}-${month.toString().padStart(2, '0')}`;
      default:
        return `${year}`;
    }
  }

  /**
   * Parse period string to get date components
   */
  static parsePeriod(period: string): { year: number; quarter?: number; month?: number } {
    const parts = period.split('-');
    const result: { year: number; quarter?: number; month?: number } = {
      year: parseInt(parts[0])
    };

    if (parts.length > 1) {
      if (parts[1].startsWith('Q')) {
        result.quarter = parseInt(parts[1].substring(1));
      } else {
        result.month = parseInt(parts[1]);
      }
    }

    return result;
  }

  /**
   * Calculate status based on actual vs target
   */
  static calculateStatus(
    actual: number | null | undefined,
    target: number | null | undefined,
    isHigherBetter: boolean = true
  ): MetricStatus {
    if (actual == null || target == null) {
      return 'no-data';
    }

    const ratio = actual / target;

    if (isHigherBetter) {
      if (ratio >= 0.95) return 'on-target';
      if (ratio >= 0.8) return 'off-target';
      return 'critical';
    } else {
      // For metrics where lower is better
      if (ratio <= 1.05) return 'on-target';
      if (ratio <= 1.2) return 'off-target';
      return 'critical';
    }
  }

  /**
   * Get aggregated data for charting
   */
  static async getChartData(
    metricId: string,
    periodType?: PeriodType,
    limit: number = 12
  ): Promise<{ period: string; target: number | null; actual: number | null }[]> {
    let query = supabase
      .from('spb_metric_time_series')
      .select('period, target_value, actual_value')
      .eq('metric_id', metricId);

    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    const { data, error } = await query
      .order('period', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }

    // Reverse to show chronological order
    return (data || []).reverse().map(item => ({
      period: item.period,
      target: item.target_value,
      actual: item.actual_value
    }));
  }
}