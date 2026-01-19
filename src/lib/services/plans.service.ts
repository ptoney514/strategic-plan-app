import { supabase } from '../supabase';
import type { Plan, PlanWithSummary } from '../types';

export class PlansService {
  /**
   * Get all plans for a district by district ID
   */
  static async getByDistrictId(districtId: string): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('spb_plans')
      .select('*')
      .eq('district_id', districtId)
      .order('order_position')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching district plans:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all plans for a district by district slug
   */
  static async getByDistrictSlug(districtSlug: string): Promise<Plan[]> {
    // First get the district ID
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', districtSlug)
      .single();

    if (districtError || !district) {
      console.error('Error fetching district:', districtError);
      return [];
    }

    return this.getByDistrictId(district.id);
  }

  /**
   * Get all plans for a school by school ID
   */
  static async getBySchoolId(schoolId: string): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('spb_plans')
      .select('*')
      .eq('school_id', schoolId)
      .order('order_position')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching school plans:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single plan by ID
   */
  static async getById(id: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('spb_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching plan:', error);
      return null;
    }

    return data;
  }

  /**
   * Get a plan by slug within a district
   */
  static async getBySlug(districtId: string, slug: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('spb_plans')
      .select('*')
      .eq('district_id', districtId)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching plan by slug:', error);
      return null;
    }

    return data;
  }

  /**
   * Get plan with summary statistics (objective count, goal count, etc.)
   */
  static async getWithSummary(planId: string): Promise<PlanWithSummary | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    // Get all goals for this plan
    const { data: goals, error: goalsError } = await supabase
      .from('spb_goals')
      .select('id, level')
      .eq('plan_id', planId);

    if (goalsError) {
      console.error('Error fetching plan goals:', goalsError);
    }

    const objectives = goals?.filter(g => g.level === 0) || [];
    const allGoals = goals || [];

    // Get metrics count for all goals in this plan
    const goalIds = allGoals.map(g => g.id);
    let metricCount = 0;

    if (goalIds.length > 0) {
      const { count } = await supabase
        .from('spb_metrics')
        .select('id', { count: 'exact', head: true })
        .in('goal_id', goalIds);
      metricCount = count || 0;
    }

    return {
      ...plan,
      objectiveCount: objectives.length,
      goalCount: allGoals.length,
      metricCount,
    };
  }

  /**
   * Create a new plan
   */
  static async create(plan: Partial<Plan>): Promise<Plan> {
    // Validate mutual exclusivity
    if (plan.district_id && plan.school_id) {
      throw new Error('Plan cannot belong to both district and school');
    }
    if (!plan.district_id && !plan.school_id) {
      throw new Error('Plan must belong to either a district or a school');
    }

    // Generate slug if not provided
    if (!plan.slug && plan.name) {
      plan.slug = this.generateSlug(plan.name);
    }

    const { data, error } = await supabase
      .from('spb_plans')
      .insert(plan)
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a plan
   */
  static async update(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data, error } = await supabase
      .from('spb_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a plan (will cascade delete all objectives within)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('spb_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  /**
   * Reorder plans
   */
  static async reorder(plans: { id: string; order_position: number }[]): Promise<void> {
    const updates = plans.map(({ id, order_position }) =>
      supabase
        .from('spb_plans')
        .update({ order_position })
        .eq('id', id)
    );

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Error reordering plans:', errors);
      throw new Error('Failed to reorder plans');
    }
  }

  /**
   * Get active public plans for a district (for public display)
   */
  static async getActiveByDistrictId(districtId: string): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('spb_plans')
      .select('*')
      .eq('district_id', districtId)
      .eq('is_public', true)
      .eq('is_active', true)
      .order('order_position');

    if (error) {
      console.error('Error fetching active plans:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get active public plans for a district by slug
   */
  static async getActiveByDistrictSlug(districtSlug: string): Promise<Plan[]> {
    // First get the district ID
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', districtSlug)
      .single();

    if (districtError || !district) {
      console.error('Error fetching district:', districtError);
      return [];
    }

    return this.getActiveByDistrictId(district.id);
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
    const plans = await this.getByDistrictId(districtId);

    // Get objective counts for all plans in one query
    const { data: objectiveCounts } = await supabase
      .from('spb_goals')
      .select('plan_id')
      .eq('level', 0)
      .in('plan_id', plans.map(p => p.id));

    // Count objectives per plan
    const countMap = new Map<string, number>();
    (objectiveCounts || []).forEach(obj => {
      if (obj.plan_id) {
        countMap.set(obj.plan_id, (countMap.get(obj.plan_id) || 0) + 1);
      }
    });

    return plans.map(plan => ({
      ...plan,
      objectiveCount: countMap.get(plan.id) || 0,
    }));
  }
}
