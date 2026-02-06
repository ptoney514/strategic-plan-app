import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../api';
import type { Metric } from '../types';
import { DistrictService } from './district.service';

export class MetricsService {
  static async getByGoal(goalId: string): Promise<Metric[]> {
    return apiGet<Metric[]>(`/goals/${goalId}/metrics`);
  }

  static async getByDistrict(districtId: string): Promise<Metric[]> {
    const district = await DistrictService.getById(districtId);
    const data = await apiGet<Metric[]>(`/organizations/${district.slug}/metrics`);
    console.log(`[MetricsService] Loaded ${data?.length || 0} metrics for district ${districtId}`);
    return data || [];
  }

  static async getById(id: string): Promise<Metric | null> {
    try {
      return await apiGet<Metric>(`/metrics/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching metric:', error);
      return null;
    }
  }

  static async create(metric: Partial<Metric>): Promise<Metric> {
    return apiPost<Metric>(`/goals/${metric.goal_id}/metrics`, metric);
  }

  static async update(id: string, updates: Partial<Metric>): Promise<Metric> {
    return apiPut<Metric>(`/metrics/${id}`, updates);
  }

  static async updateValue(id: string, value: number): Promise<Metric> {
    return apiPut<Metric>(`/metrics/${id}/value`, { value });
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`/metrics/${id}`);
  }

  static async bulkUpdate(metrics: Partial<Metric>[]): Promise<Metric[]> {
    return apiPut<Metric[]>('/metrics/bulk', { metrics });
  }

  static async reorder(metrics: { id: string; display_order: number }[]): Promise<void> {
    await apiPut('/metrics/reorder', { metrics });
  }
}
