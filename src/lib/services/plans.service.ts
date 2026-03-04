import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../api';
import type { Plan, PlanWithSummary } from '../types';
import { DistrictService } from './district.service';

export class PlansService {
  /**
   * Get all plans for a district by district ID
   */
  static async getByDistrictId(districtId: string): Promise<Plan[]> {
    const district = await DistrictService.getById(districtId);
    return apiGet<Plan[]>(`/organizations/${district.slug}/plans`);
  }

  /**
   * Get all plans for a district by district slug
   */
  static async getByDistrictSlug(districtSlug: string): Promise<Plan[]> {
    return apiGet<Plan[]>(`/organizations/${districtSlug}/plans`);
  }

  /**
   * Get a single plan by ID
   */
  static async getById(id: string): Promise<Plan | null> {
    try {
      return await apiGet<Plan>(`/plans/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching plan:', error);
      return null;
    }
  }

  /**
   * Get a plan by slug within a district
   */
  static async getBySlug(districtId: string, slug: string): Promise<Plan | null> {
    try {
      const district = await DistrictService.getById(districtId);
      const plans = await apiGet<Plan[]>(`/organizations/${district.slug}/plans`);
      return plans.find(p => p.slug === slug) || null;
    } catch (error) {
      console.error('Error fetching plan by slug:', error);
      return null;
    }
  }

  /**
   * Get plan with summary statistics (objective count, goal count, etc.)
   */
  static async getWithSummary(planId: string): Promise<PlanWithSummary | null> {
    try {
      return await apiGet<PlanWithSummary>(`/plans/${planId}/summary`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      console.error('Error fetching plan summary:', error);
      return null;
    }
  }

  /**
   * Create a new plan
   */
  static async create(plan: Partial<Plan>): Promise<Plan> {
    if (!plan.district_id) {
      throw new Error('Plan must belong to a district');
    }

    // Generate slug if not provided
    if (!plan.slug && plan.name) {
      plan.slug = this.generateSlug(plan.name);
    }

    const district = await DistrictService.getById(plan.district_id!);
    return apiPost<Plan>(`/organizations/${district.slug}/plans`, {
      name: plan.name,
      slug: plan.slug,
      type_label: plan.type_label,
      description: plan.description,
      cover_image_url: plan.cover_image_url,
      is_public: plan.is_public,
      is_active: plan.is_active,
      start_date: plan.start_date,
      end_date: plan.end_date,
      order_position: plan.order_position,
    });
  }

  /**
   * Update a plan
   */
  static async update(id: string, updates: Partial<Plan>): Promise<Plan> {
    return apiPut<Plan>(`/plans/${id}`, updates);
  }

  /**
   * Delete a plan (will cascade delete all objectives within)
   */
  static async delete(id: string): Promise<void> {
    await apiDelete(`/plans/${id}`);
  }

  /**
   * Reorder plans
   */
  static async reorder(plans: { id: string; order_position: number }[]): Promise<void> {
    await apiPut('/plans/reorder', { plans });
  }

  /**
   * Get active public plans for a district (for public display)
   */
  static async getActiveByDistrictId(districtId: string): Promise<Plan[]> {
    const district = await DistrictService.getById(districtId);
    return apiGet<Plan[]>(`/plans/active/${district.slug}`);
  }

  /**
   * Get active public plans for a district by slug
   */
  static async getActiveByDistrictSlug(districtSlug: string): Promise<Plan[]> {
    return apiGet<Plan[]>(`/plans/active/${districtSlug}`);
  }

  /**
   * Generate URL-friendly slug from plan name
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get plans with objective counts for list view
   */
  static async getPlansWithCounts(districtId: string): Promise<PlanWithSummary[]> {
    const district = await DistrictService.getById(districtId);
    return apiGet<PlanWithSummary[]>(`/user/plans-with-counts`, { orgSlug: district.slug });
  }
}
