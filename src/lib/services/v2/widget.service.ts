import { apiGet, apiPost, apiPut, apiDelete } from '../../api';
import type { Widget, CreateWidgetPayload, UpdateWidgetPayload, ReorderWidgetPayload } from '../../types/v2';

export class WidgetService {
  /** List widgets (authenticated, for admin pages) */
  static async list(orgSlug: string): Promise<Widget[]> {
    return apiGet<Widget[]>('/v2/widgets', { orgSlug });
  }

  /** List active widgets (public, no auth required) */
  static async listPublic(orgSlug: string): Promise<Widget[]> {
    return apiGet<Widget[]>('/v2/widgets/public', { orgSlug });
  }

  static async get(id: string): Promise<Widget> {
    return apiGet<Widget>(`/v2/widgets/${id}`);
  }

  static async create(orgSlug: string, data: CreateWidgetPayload): Promise<Widget> {
    return apiPost<Widget>(`/v2/widgets?orgSlug=${orgSlug}`, data);
  }

  static async update(id: string, data: UpdateWidgetPayload): Promise<Widget> {
    return apiPut<Widget>(`/v2/widgets/${id}`, data);
  }

  static async delete(id: string): Promise<void> {
    return apiDelete(`/v2/widgets/${id}`);
  }

  static async reorder(data: ReorderWidgetPayload): Promise<void> {
    return apiPut(`/v2/widgets/reorder`, data);
  }

  /** Fetch active widgets for a single goal (public, no auth) */
  static async getByGoal(goalId: string): Promise<Widget[]> {
    return apiGet<Widget[]>('/v2/widgets/by-goal', { goalId });
  }

  /** Batch fetch active widgets for multiple goals (public, no auth) */
  static async getByGoals(goalIds: string[]): Promise<Widget[]> {
    if (goalIds.length === 0) return [];
    return apiGet<Widget[]>(`/v2/widgets/by-goals?ids=${goalIds.join(',')}`);
  }
}
