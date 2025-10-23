import { supabase } from '../supabase';
import type { Goal, HierarchicalGoal } from '../types';
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

  /**
   * Renumber goals within a specific parent based on their order_position
   * This is called after reordering to update goal_number display values
   *
   * @param districtId - The district ID
   * @param parentId - The parent goal ID (null for root goals)
   */
  static async renumberGoals(districtId: string, parentId: string | null): Promise<void> {
    console.log('[GoalsService] Renumbering goals for parent:', parentId);

    // Get all sibling goals under this parent
    let query = supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', districtId);

    // Use .is() for null check, .eq() for specific parent_id
    if (parentId === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', parentId);
    }

    const { data: siblings, error: fetchError } = await query.order('order_position');

    if (fetchError) {
      console.error('[GoalsService] Error fetching siblings:', fetchError);
      throw fetchError;
    }

    if (!siblings || siblings.length === 0) {
      console.log('[GoalsService] No siblings to renumber');
      return;
    }

    // Get parent's goal_number if this is not a root goal
    let parentNumber = '';
    if (parentId) {
      const { data: parent, error: parentError } = await supabase
        .from('spb_goals')
        .select('goal_number')
        .eq('id', parentId)
        .single();

      if (parentError || !parent) {
        console.error('[GoalsService] Error fetching parent:', parentError);
        throw new Error('Parent goal not found');
      }
      parentNumber = parent.goal_number;
    }

    // Renumber each sibling sequentially
    const updates = siblings.map((goal, index) => {
      const newNumber = parentNumber
        ? `${parentNumber}.${index + 1}`
        : String(index + 1);

      console.log(`[GoalsService] Renumbering ${goal.goal_number} -> ${newNumber}`);

      return supabase
        .from('spb_goals')
        .update({ goal_number: newNumber })
        .eq('id', goal.id);
    });

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('[GoalsService] Error renumbering goals:', errors);
      throw new Error('Failed to renumber goals');
    }

    console.log('[GoalsService] Successfully renumbered goals');

    // Recursively renumber all children of the goals we just renumbered
    for (const goal of siblings) {
      await this.renumberGoals(districtId, goal.id);
    }
  }

  /**
   * Reorder goals and automatically renumber them
   *
   * @param districtId - The district ID
   * @param parentId - The parent goal ID (null for root goals)
   * @param reorderedGoals - Array of goal IDs in their new order
   */
  static async reorderAndRenumber(
    districtId: string,
    parentId: string | null,
    reorderedGoals: { id: string; order_position: number }[]
  ): Promise<void> {
    console.log('[GoalsService] Reordering and renumbering goals');

    // First update order positions
    await this.reorder(reorderedGoals);

    // Then renumber the goals
    await this.renumberGoals(districtId, parentId);
  }
}