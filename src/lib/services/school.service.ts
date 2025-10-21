import { supabase } from '../supabase';
import type { School, SchoolWithSummary } from '../types';

export class SchoolService {
  /**
   * Get all schools for a district by district slug
   */
  static async getByDistrictSlug(districtSlug: string): Promise<School[]> {
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

    // Then get all schools for that district
    const { data, error } = await supabase
      .from('spb_schools')
      .select('*')
      .eq('district_id', district.id)
      .order('name');

    if (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single school by district slug and school slug
   */
  static async getBySlug(districtSlug: string, schoolSlug: string): Promise<SchoolWithSummary | null> {
    // First get the district ID
    const { data: district, error: districtError } = await supabase
      .from('spb_districts')
      .select('id')
      .eq('slug', districtSlug)
      .single();

    if (districtError || !district) {
      console.error('Error fetching district:', districtError);
      return null;
    }

    // Then get the school
    const { data: school, error: schoolError } = await supabase
      .from('spb_schools')
      .select('*')
      .eq('district_id', district.id)
      .eq('slug', schoolSlug)
      .single();

    if (schoolError || !school) {
      console.error('Error fetching school:', schoolError);
      return null;
    }

    // Get counts for summary
    const [goalsResult, metricsResult] = await Promise.all([
      supabase
        .from('spb_goals')
        .select('id, level')
        .eq('school_id', school.id),
      supabase
        .from('spb_metrics')
        .select('id, goal_id')
        .in('goal_id', [school.id]) // Will need to join through goals
    ]);

    const goals = goalsResult.data || [];

    const summary: SchoolWithSummary = {
      ...school,
      goalCount: goals.filter(g => g.level === 0).length,
      strategyCount: goals.filter(g => g.level === 1).length,
      subGoalCount: goals.filter(g => g.level === 2).length,
      metricCount: metricsResult.data?.length || 0
    };

    return summary;
  }

  /**
   * Get a school by ID
   */
  static async getById(schoolId: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('spb_schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (error) {
      console.error('Error fetching school by ID:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new school
   */
  static async create(school: Omit<School, 'id' | 'created_at' | 'updated_at'>): Promise<School> {
    const { data, error } = await supabase
      .from('spb_schools')
      .insert(school)
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a school
   */
  static async update(schoolId: string, updates: Partial<School>): Promise<School> {
    const { data, error } = await supabase
      .from('spb_schools')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a school
   */
  static async delete(schoolId: string): Promise<void> {
    const { error } = await supabase
      .from('spb_schools')
      .delete()
      .eq('id', schoolId);

    if (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  }

  /**
   * Get school summary statistics
   */
  static async getSchoolSummary(schoolId: string): Promise<{
    goalCount: number;
    strategyCount: number;
    subGoalCount: number;
    metricCount: number;
  }> {
    const [goalsResult, metricsResult] = await Promise.all([
      supabase
        .from('spb_goals')
        .select('id, level')
        .eq('school_id', schoolId),
      supabase
        .from('spb_metrics')
        .select('id')
        .in('goal_id',
          (await supabase.from('spb_goals').select('id').eq('school_id', schoolId)).data?.map(g => g.id) || []
        )
    ]);

    const goals = goalsResult.data || [];

    return {
      goalCount: goals.filter(g => g.level === 0).length,
      strategyCount: goals.filter(g => g.level === 1).length,
      subGoalCount: goals.filter(g => g.level === 2).length,
      metricCount: metricsResult.data?.length || 0
    };
  }

  /**
   * Get all public schools (for homepage/directory)
   */
  static async getPublicSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from('spb_schools')
      .select('*')
      .eq('is_public', true)
      .order('name');

    if (error) {
      console.error('Error fetching public schools:', error);
      return [];
    }

    return data || [];
  }
}
