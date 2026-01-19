import { supabase } from '../supabase';
import type { Goal, HierarchicalGoal } from '../types';
import { buildGoalHierarchy, getNextGoalNumber } from '../types';
import { serviceLoggers } from '../utils/logger';

const log = serviceLoggers.goals;

export class GoalsService {
  static async getByDistrict(districtId: string): Promise<HierarchicalGoal[]> {
    log.debug('Fetching goals for district:', districtId);

    // Note: We don't filter by school_id IS NULL because:
    // 1. The database constraint ensures district goals have school_id = NULL
    // 2. The .is() filter can cause issues with some Supabase versions
    const { data: goals, error } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .eq('district_id', districtId)
      .order('goal_number');

    if (error) {
      log.error('Error fetching goals:', error);
      throw error;
    }

    log.debug('Raw goals from DB:', goals?.length ?? 0, 'goals');

    const hierarchy = buildGoalHierarchy(goals || []);

    log.debug('After buildGoalHierarchy:', hierarchy.length, 'top-level goals');

    return hierarchy;
  }

  /**
   * Get goals for a specific school
   * @param schoolId - The school ID to fetch goals for
   * @returns Hierarchical array of goals belonging to the school
   */
  static async getBySchool(schoolId: string): Promise<HierarchicalGoal[]> {
    log.debug('Fetching goals for school:', schoolId);

    const { data: goals, error } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .eq('school_id', schoolId)
      .order('goal_number');

    if (error) {
      log.error('Error fetching school goals:', error);
      throw error;
    }

    log.debug('Raw school goals from DB:', goals?.length ?? 0, 'goals');

    const hierarchy = buildGoalHierarchy(goals || []);

    log.debug('After buildGoalHierarchy:', hierarchy.length, 'top-level school goals');

    return hierarchy;
  }

  /**
   * Get goals (objectives) for a specific plan
   * @param planId - The plan ID to fetch objectives for
   * @returns Hierarchical array of objectives belonging to the plan (with their children)
   */
  static async getByPlan(planId: string): Promise<HierarchicalGoal[]> {
    log.debug('Fetching goals for plan:', planId);

    // First get the level 0 goals (objectives) for this plan
    const { data: objectives, error: objError } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .eq('plan_id', planId)
      .eq('level', 0)
      .order('goal_number');

    if (objError) {
      log.error('Error fetching plan objectives:', objError);
      throw objError;
    }

    if (!objectives || objectives.length === 0) {
      return [];
    }

    // Get all child goals for these objectives
    const objectiveIds = objectives.map(o => o.id);
    const { data: childGoals, error: childError } = await supabase
      .from('spb_goals')
      .select(`
        *,
        metrics:spb_metrics(*)
      `)
      .in('parent_id', objectiveIds)
      .order('goal_number');

    if (childError) {
      log.error('Error fetching child goals:', childError);
      throw childError;
    }

    // Combine objectives and children
    const allGoals = [...objectives, ...(childGoals || [])];

    // If there are level 1 goals, fetch level 2 as well
    const level1Ids = (childGoals || []).filter(g => g.level === 1).map(g => g.id);
    if (level1Ids.length > 0) {
      const { data: grandchildren, error: grandchildError } = await supabase
        .from('spb_goals')
        .select(`
          *,
          metrics:spb_metrics(*)
        `)
        .in('parent_id', level1Ids)
        .order('goal_number');

      if (!grandchildError && grandchildren) {
        allGoals.push(...grandchildren);
      }
    }

    log.debug('Total goals for plan:', allGoals.length);

    const hierarchy = buildGoalHierarchy(allGoals);

    log.debug('After buildGoalHierarchy:', hierarchy.length, 'top-level plan objectives');

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

  /**
   * Create a new goal for district or school
   * Note: Goal can belong to either a district OR a school, not both (mutual exclusivity)
   * @param goal - Goal data including either district_id or school_id
   */
  static async create(goal: Partial<Goal>): Promise<Goal> {
    // Validate mutual exclusivity - goal belongs to district OR school, not both
    if (goal.district_id && goal.school_id) {
      throw new Error('Goal cannot belong to both district and school');
    }
    if (!goal.district_id && !goal.school_id) {
      throw new Error('Goal must belong to either a district or a school');
    }

    // Get all goals for the district or school to calculate next number
    let query = supabase.from('spb_goals').select('*');

    if (goal.school_id) {
      query = query.eq('school_id', goal.school_id);
    } else {
      query = query.eq('district_id', goal.district_id).is('school_id', null);
    }

    const { data: existingGoals } = await query;

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
   * Supports both district and school contexts
   *
   * @param options - Object containing either districtId or schoolId, and parentId
   */
  static async renumberGoals(
    options: { districtId?: string; schoolId?: string },
    parentId: string | null
  ): Promise<void> {
    const { districtId, schoolId } = options;

    // Validate that exactly one of districtId or schoolId is provided
    if (districtId && schoolId) {
      throw new Error('Cannot renumber with both districtId and schoolId');
    }
    if (!districtId && !schoolId) {
      throw new Error('Must provide either districtId or schoolId');
    }

    console.log('[GoalsService] Renumbering goals for parent:', parentId);

    // Get all sibling goals under this parent
    let query = supabase.from('spb_goals').select('*');

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    } else {
      query = query.eq('district_id', districtId).is('school_id', null);
    }

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
      await this.renumberGoals(options, goal.id);
    }
  }

  /**
   * Reorder goals and automatically renumber them
   * Supports both district and school contexts
   *
   * @param options - Object containing either districtId or schoolId
   * @param parentId - The parent goal ID (null for root goals)
   * @param reorderedGoals - Array of goal IDs in their new order
   */
  static async reorderAndRenumber(
    options: { districtId?: string; schoolId?: string },
    parentId: string | null,
    reorderedGoals: { id: string; order_position: number }[]
  ): Promise<void> {
    console.log('[GoalsService] Reordering and renumbering goals');

    // First update order positions
    await this.reorder(reorderedGoals);

    // Then renumber the goals
    await this.renumberGoals(options, parentId);
  }
}