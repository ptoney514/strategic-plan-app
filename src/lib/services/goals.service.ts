import { supabase } from '../supabase';
import type { Goal, HierarchicalGoal, Metric } from '../types';
import { buildGoalHierarchy, getNextGoalNumber } from '../types';

export class GoalsService {
  static async getByDistrict(districtId: string): Promise<HierarchicalGoal[]> {
    console.log('[GoalsService] Fetching goals for district:', districtId);

    const { data: goals, error } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .eq('district_id', districtId)
      .order('goal_number');

    if (error) {
      console.error('[GoalsService] Error fetching goals:', error);
      console.error('[GoalsService] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('[GoalsService] Raw goals from DB:', goals?.map(g => ({
      goal_number: g.goal_number,
      id: g.id,
      metrics_count: g.metrics?.length || 0,
      level: g.level
    })));

    const hierarchy = buildGoalHierarchy(goals || []);

    console.log('[GoalsService] After buildGoalHierarchy:', hierarchy.map(g => ({
      goal_number: g.goal_number,
      metrics_count: g.metrics?.length || 0,
      children: g.children?.map(c => ({
        goal_number: c.goal_number,
        metrics_count: c.metrics?.length || 0,
        children: c.children?.map(gc => ({
          goal_number: gc.goal_number,
          metrics_count: gc.metrics?.length || 0
        }))
      }))
    })));

    return hierarchy;
  }

  static async getById(id: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching goal:', error);
      return null;
    }

    return data;
  }

  static async getChildren(parentId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .eq('parent_id', parentId)
      .order('goal_number');

    if (error) {
      console.error('Error fetching child goals:', error);
      throw error;
    }

    return data || [];
  }

  static async create(goal: Partial<Goal>): Promise<Goal> {
    // Get all goals for the district to calculate next number
    const { data: existingGoals } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', goal.district_id);

    const goalNumber = getNextGoalNumber(
      existingGoals || [],
      goal.parent_id || null,
      goal.level as 0 | 1 | 2
    );

    const { data, error } = await supabase
      .from('spb_goals')
      .insert({
        ...goal,
        goal_number: goalNumber
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('spb_goals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    // Delete all child goals first (cascade)
    const { data: children } = await supabase
      .from('spb_goals')
      .select('id')
      .eq('parent_id', id);

    if (children && children.length > 0) {
      for (const child of children) {
        await this.delete(child.id);
      }
    }

    // Delete associated metrics
    await supabase
      .from('spb_metrics')
      .delete()
      .eq('goal_id', id);

    // Delete the goal itself
    const { error } = await supabase
      .from('spb_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  static async reorder(goals: { id: string; order_position: number }[]): Promise<void> {
    const updates = goals.map(({ id, order_position }) =>
      supabase
        .from('spb_goals')
        .update({ order_position })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Error reordering goals:', errors);
      throw new Error('Failed to reorder goals');
    }
  }
}