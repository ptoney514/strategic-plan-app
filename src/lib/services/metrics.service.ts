import { supabase } from '../supabase';
import type { Metric } from '../types';

export class MetricsService {
  static async getByGoal(goalId: string): Promise<Metric[]> {
    const { data, error } = await supabase
      .from('spb_metrics')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }

    return data || [];
  }

  static async getByDistrict(districtId: string): Promise<Metric[]> {
    // Join through spb_goals to filter metrics by district
    const { data, error } = await supabase
      .from('spb_metrics')
      .select(`
        *,
        spb_goals!inner(district_id)
      `)
      .eq('spb_goals.district_id', districtId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching metrics by district:', error);
      throw error;
    }

    console.log(`[MetricsService] Loaded ${data?.length || 0} metrics for district ${districtId}`);
    // Remove the joined goal data from the response
    return (data || []).map(({ spb_goals, ...metric }) => metric as Metric);
  }

  static async getById(id: string): Promise<Metric | null> {
    const { data, error } = await supabase
      .from('spb_metrics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching metric:', error);
      return null;
    }

    return data;
  }

  static async create(metric: Partial<Metric>): Promise<Metric> {
    const { data, error } = await supabase
      .from('spb_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) {
      console.error('Error creating metric:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, updates: Partial<Metric>): Promise<Metric> {
    const { data, error } = await supabase
      .from('spb_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating metric:', error);
      throw error;
    }

    return data;
  }

  static async updateValue(id: string, value: number): Promise<Metric> {
    const updates: Partial<Metric> = {
      current_value: value,
      actual_value: value,
      updated_at: new Date().toISOString()
    };

    // Calculate status based on value and target
    const metric = await this.getById(id);
    if (metric && metric.target_value) {
      const percentage = (value / metric.target_value) * 100;
      
      if (percentage >= 100) {
        updates.status = 'on-target';
      } else if (percentage >= 70) {
        updates.status = 'on-target';
      } else if (percentage >= 40) {
        updates.status = 'off-target';
      } else {
        updates.status = 'critical';
      }
    }

    return this.update(id, updates);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('spb_metrics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  }

  static async bulkUpdate(metrics: Partial<Metric>[]): Promise<Metric[]> {
    const updates = metrics.map(metric =>
      this.update(metric.id!, metric)
    );

    const results = await Promise.all(updates);
    return results;
  }

  static async reorder(metrics: { id: string; display_order: number }[]): Promise<void> {
    const updates = metrics.map(({ id, display_order }) =>
      supabase
        .from('spb_metrics')
        .update({ display_order })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Error reordering metrics:', errors);
      throw new Error('Failed to reorder metrics');
    }
  }
}