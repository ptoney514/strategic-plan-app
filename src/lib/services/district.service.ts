import { supabase } from '../supabase';
import type { District } from '../types';

export class DistrictService {
  static async getAll(): Promise<District[]> {
    console.log('[DistrictService] Fetching all districts with counts...');

    // Fetch all districts
    const { data: districts, error } = await supabase
      .from('spb_districts')
      .select('*')
      .order('name');

    if (error) {
      console.error('[DistrictService] Error fetching districts:', error);
      throw error;
    }

    if (!districts) return [];

    // Fetch counts for all districts in parallel
    const districtsWithCounts = await Promise.all(
      districts.map(async (district) => {
        const [goalsResult, metricsResult, adminsResult] = await Promise.all([
          // Count all goals for this district
          supabase
            .from('spb_goals')
            .select('id', { count: 'exact', head: true })
            .eq('district_id', district.id),

          // Count all metrics for this district
          supabase
            .from('spb_metrics')
            .select('id', { count: 'exact', head: true })
            .eq('district_id', district.id),

          // Count district admins for this district
          supabase
            .from('spb_district_admins')
            .select('id', { count: 'exact', head: true })
            .eq('district_id', district.id),
        ]);

        return {
          ...district,
          goals_count: goalsResult.count || 0,
          metrics_count: metricsResult.count || 0,
          admins_count: adminsResult.count || 0,
        };
      })
    );

    console.log(`[DistrictService] Loaded ${districtsWithCounts.length} districts with counts`);
    return districtsWithCounts;
  }

  static async getBySlug(slug: string): Promise<District | null> {
    const { data: district, error } = await supabase
      .from('spb_districts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching district:', error);
      return null;
    }

    // Get counts using efficient count queries
    const [goalsResult, metricsResult, adminsResult] = await Promise.all([
      supabase
        .from('spb_goals')
        .select('id', { count: 'exact', head: true })
        .eq('district_id', district.id),
      supabase
        .from('spb_metrics')
        .select('id', { count: 'exact', head: true })
        .eq('district_id', district.id),
      supabase
        .from('spb_district_admins')
        .select('id', { count: 'exact', head: true })
        .eq('district_id', district.id),
    ]);

    return {
      ...district,
      goals_count: goalsResult.count || 0,
      metrics_count: metricsResult.count || 0,
      admins_count: adminsResult.count || 0,
    };
  }

  static async create(district: Partial<District>): Promise<District> {
    const { data, error } = await supabase
      .from('spb_districts')
      .insert(district)
      .select()
      .single();

    if (error) {
      console.error('Error creating district:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updates: Partial<District>): Promise<District> {
    const { data, error } = await supabase
      .from('spb_districts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating district:', error);
      throw error;
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('spb_districts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting district:', error);
      throw error;
    }
  }
}