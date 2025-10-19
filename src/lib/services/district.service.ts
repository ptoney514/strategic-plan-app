import { supabase } from '../supabase';
import type { District, DistrictWithSummary } from '../types';

export class DistrictService {
  static async getAll(): Promise<District[]> {
    const { data, error } = await supabase
      .from('spb_districts')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }

    return data || [];
  }

  static async getBySlug(slug: string): Promise<DistrictWithSummary | null> {
    const { data: district, error } = await supabase
      .from('spb_districts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching district:', error);
      return null;
    }

    // Get counts for summary
    const [goalsResult, metricsResult] = await Promise.all([
      supabase
        .from('spb_goals')
        .select('id, level')
        .eq('district_id', district.id),
      supabase
        .from('spb_metrics')
        .select('id')
        .eq('district_id', district.id)
    ]);

    const goals = goalsResult.data || [];
    const metrics = metricsResult.data || [];

    const summary: DistrictWithSummary = {
      ...district,
      goalCount: goals.filter(g => g.level === 0).length,
      strategyCount: goals.filter(g => g.level === 1).length,
      subGoalCount: goals.filter(g => g.level === 2).length,
      metricCount: metrics.length,
      lastActivity: district.updated_at
    };

    return summary;
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