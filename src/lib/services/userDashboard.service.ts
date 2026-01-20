import { supabase } from '../supabase';
import type { District, Plan, PlanWithSummary } from '../types';

export interface UserDashboardStats {
  activePlansCount: number;
  totalObjectivesCount: number;
  districtsCount: number;
}

export class UserDashboardService {
  /**
   * Get all districts the current user has admin access to
   */
  static async getUserDistricts(): Promise<District[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // Check if user is a system admin (has access to all districts)
    const isSystemAdmin =
      user.user_metadata?.role === 'system_admin' ||
      user.app_metadata?.role === 'system_admin';

    if (isSystemAdmin) {
      // System admins can see all districts
      const { data: districts, error } = await supabase
        .from('spb_districts')
        .select('*')
        .order('name');

      if (error) {
        console.error('[UserDashboardService] Error fetching all districts:', error);
        throw error;
      }

      return districts || [];
    }

    // Regular users: get districts they are admins of
    const { data: adminRecords, error: adminError } = await supabase
      .from('spb_district_admins')
      .select('district_id')
      .eq('user_id', user.id);

    if (adminError) {
      console.error('[UserDashboardService] Error fetching user districts:', adminError);
      throw adminError;
    }

    if (!adminRecords || adminRecords.length === 0) {
      return [];
    }

    const districtIds = adminRecords.map(r => r.district_id);

    const { data: districts, error: districtsError } = await supabase
      .from('spb_districts')
      .select('*')
      .in('id', districtIds)
      .order('name');

    if (districtsError) {
      console.error('[UserDashboardService] Error fetching districts:', districtsError);
      throw districtsError;
    }

    return districts || [];
  }

  /**
   * Get all plans across all districts the user has access to
   */
  static async getUserPlans(): Promise<Plan[]> {
    const districts = await this.getUserDistricts();

    if (districts.length === 0) {
      return [];
    }

    const districtIds = districts.map(d => d.id);

    const { data: plans, error } = await supabase
      .from('spb_plans')
      .select('*')
      .in('district_id', districtIds)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[UserDashboardService] Error fetching user plans:', error);
      throw error;
    }

    return plans || [];
  }

  /**
   * Get plans with objective counts for the dashboard
   */
  static async getUserPlansWithCounts(): Promise<PlanWithSummary[]> {
    const plans = await this.getUserPlans();

    if (plans.length === 0) {
      return [];
    }

    // Get objective counts for all plans in one query
    const planIds = plans.map(p => p.id);
    const { data: objectiveCounts } = await supabase
      .from('spb_goals')
      .select('plan_id')
      .eq('level', 0)
      .in('plan_id', planIds);

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

  /**
   * Get dashboard statistics for the welcome banner
   */
  static async getDashboardStats(): Promise<UserDashboardStats> {
    const districts = await this.getUserDistricts();

    if (districts.length === 0) {
      return {
        activePlansCount: 0,
        totalObjectivesCount: 0,
        districtsCount: 0,
      };
    }

    const districtIds = districts.map(d => d.id);

    // Get active plans count
    const { count: plansCount } = await supabase
      .from('spb_plans')
      .select('id', { count: 'exact', head: true })
      .in('district_id', districtIds)
      .eq('is_active', true);

    // Get total objectives count (level 0 goals)
    const { count: objectivesCount } = await supabase
      .from('spb_goals')
      .select('id', { count: 'exact', head: true })
      .in('district_id', districtIds)
      .eq('level', 0);

    return {
      activePlansCount: plansCount || 0,
      totalObjectivesCount: objectivesCount || 0,
      districtsCount: districts.length,
    };
  }
}
