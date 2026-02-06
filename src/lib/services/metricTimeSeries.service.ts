import { apiGet, apiPost, apiDelete } from '../api';
import type { MetricTimeSeries, PeriodType, MetricStatus } from '../types';

export class MetricTimeSeriesService {
  /**
   * Get all time series data for a metric
   */
  static async getByMetricId(metricId: string): Promise<MetricTimeSeries[]> {
    return apiGet<MetricTimeSeries[]>(`/metrics/${metricId}/time-series`);
  }

  /**
   * Get time series data for a specific period range
   */
  static async getByPeriodRange(
    metricId: string,
    startPeriod: string,
    endPeriod: string
  ): Promise<MetricTimeSeries[]> {
    return apiGet<MetricTimeSeries[]>(`/metrics/${metricId}/time-series`, {
      startPeriod,
      endPeriod,
    });
  }

  /**
   * Create or update a time series entry
   */
  static async upsert(entry: Partial<MetricTimeSeries>): Promise<MetricTimeSeries> {
    return apiPost<MetricTimeSeries>(`/metrics/${entry.metric_id}/time-series`, entry);
  }

  /**
   * Delete a time series entry
   */
  static async delete(id: string, metricId?: string): Promise<void> {
    // If metricId provided, use the nested route
    if (metricId) {
      await apiDelete(`/metrics/${metricId}/time-series?entryId=${id}`);
    } else {
      await apiDelete(`/metrics/time-series/${id}`);
    }
  }

  /**
   * Calculate YTD average for a metric
   */
  static async calculateYTD(metricId: string, year: number = new Date().getFullYear()): Promise<number | null> {
    const data = await this.getByMetricId(metricId);
    const yearData = data.filter(d => d.period.startsWith(String(year)) && d.actual_value != null);

    if (yearData.length === 0) return null;

    const sum = yearData.reduce((acc, item) => acc + (item.actual_value || 0), 0);
    return sum / yearData.length;
  }

  /**
   * Calculate EOY projection based on current trend
   */
  static async calculateEOYProjection(
    metricId: string,
    _frequency: 'monthly' | 'quarterly' | 'yearly',
    year: number = new Date().getFullYear()
  ): Promise<number | null> {
    const data = await this.getByMetricId(metricId);
    const yearData = data
      .filter(d => d.period.startsWith(String(year)) && d.actual_value != null)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (yearData.length === 0) return null;

    const average = yearData.reduce((acc, item) => acc + (item.actual_value || 0), 0) / yearData.length;
    return average;
  }

  /**
   * Get the latest actual value and period
   */
  static async getLatestActual(metricId: string): Promise<{ value: number; period: string } | null> {
    const data = await this.getByMetricId(metricId);
    const withActual = data
      .filter(d => d.actual_value != null)
      .sort((a, b) => b.period.localeCompare(a.period));

    if (withActual.length === 0) return null;

    return {
      value: withActual[0].actual_value!,
      period: withActual[0].period,
    };
  }

  /**
   * Generate period string based on type and date
   */
  static generatePeriod(date: Date, periodType: PeriodType): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
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
    const data = await this.getByMetricId(metricId);

    let filtered = data;
    if (periodType) {
      filtered = data.filter(d => d.period_type === periodType);
    }

    // Sort descending, take limit, reverse for chronological
    const sorted = filtered
      .sort((a, b) => b.period.localeCompare(a.period))
      .slice(0, limit)
      .reverse();

    return sorted.map(item => ({
      period: item.period,
      target: item.target_value ?? null,
      actual: item.actual_value ?? null,
    }));
  }
}
