import { supabase } from '../supabase';
import type {
  ImportSession,
  StagedGoal,
  StagedMetric,
  ParsedExcelData,
  ImportSummary,
  ImportProgress
} from '../types/import.types';
import type { Goal, Metric } from '../types';
import { ValidationService } from './validation.service';

/**
 * Import Service
 * Handles the full import pipeline from Excel to production tables
 */
export class ImportService {

  /**
   * Create a new import session
   */
  static async createSession(
    districtId: string,
    filename: string,
    fileSize: number,
    uploadedBy?: string
  ): Promise<ImportSession> {
    const { data, error } = await supabase
      .from('spb_import_sessions')
      .insert({
        district_id: districtId,
        filename,
        file_size: fileSize,
        status: 'uploaded',
        uploaded_by: uploadedBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating import session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update session status
   */
  static async updateSessionStatus(
    sessionId: string,
    status: ImportSession['status'],
    errorMessage?: string
  ): Promise<void> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('spb_import_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Stage parsed data for review
   */
  static async stageData(
    sessionId: string,
    districtId: string,
    parsedData: ParsedExcelData,
    existingGoals: Goal[]
  ): Promise<{ stagedGoals: StagedGoal[]; stagedMetrics: StagedMetric[] }> {
    await this.updateSessionStatus(sessionId, 'parsing');

    // Validate all goals
    const validationResults = ValidationService.validateAllGoals(parsedData.goals, existingGoals);

    // Insert staged goals
    const stagedGoalsToInsert = parsedData.goals.map(goal => {
      const validation = validationResults.get(goal.row_number) || {
        status: 'valid' as const,
        messages: [],
        autoFixSuggestions: []
      };

      // Map 'fixable' status to 'warning' for database (constraint only allows valid/warning/error)
      const dbStatus = validation.status === 'fixable' ? 'warning' : validation.status;

      return {
        import_session_id: sessionId,
        row_number: goal.row_number,
        raw_data: goal.raw_data,
        parsed_hierarchy: goal.hierarchy,
        goal_number: goal.goal_number,
        title: goal.title,
        description: goal.description,
        level: goal.level,
        owner_name: goal.owner_name,
        validation_status: dbStatus,
        validation_messages: validation.messages,
        auto_fix_suggestions: validation.autoFixSuggestions || [],
        is_mapped: false,
        is_auto_generated: false,
        action: 'create'
      };
    });

    const { data: stagedGoals, error: goalsError } = await supabase
      .from('spb_staged_goals')
      .insert(stagedGoalsToInsert)
      .select();

    if (goalsError) {
      console.error('Error staging goals:', goalsError);
      throw goalsError;
    }

    // Insert staged metrics
    const stagedMetricsToInsert: any[] = [];
    parsedData.goals.forEach((goal, index) => {
      const stagedGoal = stagedGoals![index];

      goal.metrics.forEach(metric => {
        const validation = ValidationService.validateMetric(metric);

        stagedMetricsToInsert.push({
          staged_goal_id: stagedGoal.id,
          import_session_id: sessionId,
          metric_name: metric.name,
          measure_description: metric.measure_description,
          frequency: metric.frequency,
          baseline_value: metric.baseline_value,
          time_series_data: metric.time_series,
          symbol: metric.symbol,
          validation_status: validation.status,
          validation_messages: validation.messages,
          is_mapped: false,
          action: 'create'
        });
      });
    });

    let stagedMetrics: StagedMetric[] = [];
    if (stagedMetricsToInsert.length > 0) {
      const { data, error: metricsError } = await supabase
        .from('spb_staged_metrics')
        .insert(stagedMetricsToInsert)
        .select();

      if (metricsError) {
        console.error('Error staging metrics:', metricsError);
        throw metricsError;
      }

      stagedMetrics = data || [];
    }

    await this.updateSessionStatus(sessionId, 'parsed');

    return { stagedGoals: stagedGoals || [], stagedMetrics };
  }

  /**
   * Get staged data for a session
   */
  static async getStagedData(sessionId: string): Promise<{
    goals: StagedGoal[];
    metrics: StagedMetric[];
  }> {
    const [goalsResult, metricsResult] = await Promise.all([
      supabase
        .from('spb_staged_goals')
        .select('*')
        .eq('import_session_id', sessionId)
        .order('row_number'),
      supabase
        .from('spb_staged_metrics')
        .select('*')
        .eq('import_session_id', sessionId)
    ]);

    if (goalsResult.error) throw goalsResult.error;
    if (metricsResult.error) throw metricsResult.error;

    return {
      goals: goalsResult.data || [],
      metrics: metricsResult.data || []
    };
  }

  /**
   * Update a staged goal
   */
  static async updateStagedGoal(
    stagedGoalId: string,
    updates: Partial<StagedGoal>
  ): Promise<StagedGoal> {
    const { data, error } = await supabase
      .from('spb_staged_goals')
      .update(updates)
      .eq('id', stagedGoalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating staged goal:', error);
      throw error;
    }

    return data;
  }

  /**
   * Execute import - move staged data to production tables
   */
  static async executeImport(
    sessionId: string,
    districtId: string,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportSummary> {
    await this.updateSessionStatus(sessionId, 'importing');

    const { goals: stagedGoals, metrics: stagedMetrics } = await this.getStagedData(sessionId);

    // Filter goals to import (skip those marked as 'skip')
    const goalsToImport = stagedGoals.filter(g => g.action !== 'skip' && g.validation_status !== 'error');

    const summary: ImportSummary = {
      goals_created: 0,
      goals_updated: 0,
      metrics_created: 0,
      metrics_updated: 0,
      errors: 0,
      warnings: 0
    };

    // Create a map to track staged goal ID → production goal ID
    const goalIdMap = new Map<string, string>();

    // Import goals in order (parents first)
    const sortedGoals = goalsToImport.sort((a, b) => (a.level || 0) - (b.level || 0));

    for (let i = 0; i < sortedGoals.length; i++) {
      const stagedGoal = sortedGoals[i];

      if (onProgress) {
        onProgress({
          stage: 'importing',
          currentItem: i + 1,
          totalItems: sortedGoals.length,
          message: `Importing goal ${stagedGoal.goal_number}: ${stagedGoal.title}`
        });
      }

      try {
        // Find parent_id if this is a child goal
        let parent_id: string | null = null;
        if (stagedGoal.level && stagedGoal.level > 0 && stagedGoal.goal_number) {
          const parentNumber = this.getParentGoalNumber(stagedGoal.goal_number);
          if (parentNumber) {
            // Check if parent was imported in this session
            const parentStaged = stagedGoals.find(g => g.goal_number === parentNumber);
            if (parentStaged && goalIdMap.has(parentStaged.id)) {
              parent_id = goalIdMap.get(parentStaged.id)!;
            } else {
              // Check existing goals
              const { data: existingParent } = await supabase
                .from('spb_goals')
                .select('id')
                .eq('district_id', districtId)
                .eq('goal_number', parentNumber)
                .single();

              if (existingParent) {
                parent_id = existingParent.id;
              }
            }
          }
        }

        if (stagedGoal.action === 'update' && stagedGoal.mapped_to_goal_id) {
          // Update existing goal
          const { error } = await supabase
            .from('spb_goals')
            .update({
              title: stagedGoal.title,
              description: stagedGoal.description,
              owner_name: stagedGoal.owner_name,
              updated_at: new Date().toISOString()
            })
            .eq('id', stagedGoal.mapped_to_goal_id);

          if (error) throw error;

          goalIdMap.set(stagedGoal.id, stagedGoal.mapped_to_goal_id);
          summary.goals_updated++;
        } else {
          // Create new goal
          const { data: newGoal, error } = await supabase
            .from('spb_goals')
            .insert({
              district_id: districtId,
              parent_id,
              goal_number: stagedGoal.goal_number,
              title: stagedGoal.title,
              description: stagedGoal.description || '',
              level: stagedGoal.level || 0,
              owner_name: stagedGoal.owner_name,
              order_position: i
            })
            .select('id')
            .single();

          if (error) throw error;

          goalIdMap.set(stagedGoal.id, newGoal.id);
          summary.goals_created++;
        }
      } catch (error) {
        console.error(`Error importing goal ${stagedGoal.goal_number}:`, error);
        summary.errors++;
      }
    }

    // Import metrics
    const metricsToImport = stagedMetrics.filter(m =>
      m.action !== 'skip' &&
      m.validation_status !== 'error' &&
      goalIdMap.has(m.staged_goal_id)
    );

    for (const stagedMetric of metricsToImport) {
      try {
        const goalId = goalIdMap.get(stagedMetric.staged_goal_id)!;

        const { error } = await supabase
          .from('spb_metrics')
          .insert({
            goal_id: goalId,
            metric_name: stagedMetric.metric_name || stagedMetric.metric_name,
            name: stagedMetric.metric_name,
            description: stagedMetric.measure_description,
            unit: stagedMetric.symbol || '',
            frequency: this.mapFrequency(stagedMetric.frequency),
            aggregation_method: 'latest',
            baseline_value: stagedMetric.baseline_value,
            district_id: districtId
          });

        if (error) throw error;

        summary.metrics_created++;
      } catch (error) {
        console.error('Error importing metric:', error);
        summary.errors++;
      }
    }

    // Update session with summary
    await supabase
      .from('spb_import_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        import_summary: summary
      })
      .eq('id', sessionId);

    return summary;
  }

  /**
   * Get parent goal number
   */
  private static getParentGoalNumber(goalNumber: string): string | null {
    const parts = goalNumber.split('.');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
  }

  /**
   * Map frequency text to standard values
   */
  private static mapFrequency(frequency?: string): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' {
    if (!frequency) return 'monthly';

    const lower = frequency.toLowerCase();
    if (lower.includes('annual') || lower.includes('year')) return 'yearly';
    if (lower.includes('quarter')) return 'quarterly';
    if (lower.includes('month')) return 'monthly';
    if (lower.includes('week')) return 'weekly';
    if (lower.includes('day')) return 'daily';

    return 'monthly'; // default
  }

  /**
   * Get import session by ID
   */
  static async getSession(sessionId: string): Promise<ImportSession | null> {
    const { data, error } = await supabase
      .from('spb_import_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching import session:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all sessions for a district
   */
  static async getSessionsByDistrict(districtId: string): Promise<ImportSession[]> {
    const { data, error } = await supabase
      .from('spb_import_sessions')
      .select('*')
      .eq('district_id', districtId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching import sessions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Delete an import session and all staged data
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('spb_import_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting import session:', error);
      throw error;
    }
  }
}
