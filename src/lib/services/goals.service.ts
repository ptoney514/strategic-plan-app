import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import type { Goal, HierarchicalGoal } from '../types';
import { buildGoalHierarchy, getNextGoalNumber } from '../types';
import { serviceLoggers } from '../utils/logger';
import { DistrictService } from './district.service';

const log = serviceLoggers.goals;

export class GoalsService {
  static async getByDistrict(districtId: string): Promise<HierarchicalGoal[]> {
    log.debug('Fetching goals for district:', districtId);

    const district = await DistrictService.getById(districtId);
    const goals = await apiGet<Goal[]>(`/organizations/${district.slug}/goals`);

    log.debug('Raw goals from API:', goals?.length ?? 0, 'goals');

    const hierarchy = buildGoalHierarchy(goals || []);

    log.debug('After buildGoalHierarchy:', hierarchy.length, 'top-level goals');

    return hierarchy;
  }

  /**
   * Get goals for a specific school
   */
  static async getBySchool(schoolId: string): Promise<HierarchicalGoal[]> {
    log.debug('Fetching goals for school:', schoolId);

    const goals = await apiGet<Goal[]>(`/schools/${schoolId}/goals`);

    log.debug('Raw school goals from API:', goals?.length ?? 0, 'goals');

    const hierarchy = buildGoalHierarchy(goals || []);

    log.debug('After buildGoalHierarchy:', hierarchy.length, 'top-level school goals');

    return hierarchy;
  }

  /**
   * Get goals (objectives) for a specific plan
   */
  static async getByPlan(planId: string): Promise<HierarchicalGoal[]> {
    log.debug('Fetching goals for plan:', planId);

    // The API returns all goals for the plan with metrics nested
    const goals = await apiGet<Goal[]>(`/plans/${planId}/goals`);

    log.debug('Total goals for plan:', goals?.length ?? 0);

    const hierarchy = buildGoalHierarchy(goals || []);

    log.debug('After buildGoalHierarchy:', hierarchy.length, 'top-level plan objectives');

    return hierarchy;
  }

  static async getById(id: string): Promise<Goal | null> {
    try {
      return await apiGet<Goal>(`/goals/${id}`);
    } catch {
      console.error('Error fetching goal');
      return null;
    }
  }

  static async getChildren(parentId: string): Promise<Goal[]> {
    return apiGet<Goal[]>(`/goals/${parentId}/children`);
  }

  /**
   * Create a new goal for district or school
   */
  static async create(goal: Partial<Goal>): Promise<Goal> {
    // Validate mutual exclusivity
    if (goal.district_id && goal.school_id) {
      throw new Error('Goal cannot belong to both district and school');
    }
    if (!goal.district_id && !goal.school_id) {
      throw new Error('Goal must belong to either a district or a school');
    }

    // Get existing goals to calculate next goal number
    let existingGoals: Goal[] = [];
    if (goal.plan_id) {
      existingGoals = await apiGet<Goal[]>(`/plans/${goal.plan_id}/goals`);
    }

    const goalNumber = getNextGoalNumber(
      existingGoals || [],
      goal.parent_id || null,
      goal.level as 0 | 1 | 2
    );

    return apiPost<Goal>(`/plans/${goal.plan_id}/goals`, {
      ...goal,
      goal_number: goalNumber,
    });
  }

  static async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    return apiPut<Goal>(`/goals/${id}`, updates);
  }

  static async delete(id: string): Promise<void> {
    await apiDelete(`/goals/${id}`);
  }

  static async reorder(goals: { id: string; order_position: number }[]): Promise<void> {
    await apiPut('/goals/reorder', { goals });
  }

  /**
   * Renumber goals within a specific parent
   */
  static async renumberGoals(
    options: { districtId?: string; schoolId?: string },
    parentId: string | null
  ): Promise<void> {
    await apiPut('/goals/renumber', {
      district_id: options.districtId,
      school_id: options.schoolId,
      parent_id: parentId,
    });
  }

  /**
   * Reorder goals and automatically renumber them
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
