import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import type {
  ImportSession,
  StagedGoal,
  StagedMetric,
  ParsedExcelData,
  ImportSummary,
  ImportProgress
} from '../types/import.types';
import type { Goal } from '../types';
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
    return apiPost<ImportSession>('/imports/sessions', {
      district_id: districtId,
      filename,
      file_size: fileSize,
      uploaded_by: uploadedBy,
    });
  }

  /**
   * Stage parsed data for review
   */
  static async stageData(
    sessionId: string,
    _districtId: string,
    parsedData: ParsedExcelData,
    existingGoals: Goal[]
  ): Promise<{ stagedGoals: StagedGoal[]; stagedMetrics: StagedMetric[] }> {
    // Validate all goals client-side
    const validationResults = ValidationService.validateAllGoals(parsedData.goals, existingGoals);

    // Prepare staged goals
    const stagedGoalsToInsert = parsedData.goals.map(goal => {
      const validation = validationResults.get(goal.row_number) || {
        status: 'valid' as const,
        messages: [],
        autoFixSuggestions: []
      };

      const dbStatus = validation.status === 'fixable' ? 'warning' : validation.status;

      return {
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

    // Prepare staged metrics
    const stagedMetricsToInsert: Record<string, unknown>[] = [];
    parsedData.goals.forEach((goal) => {
      goal.metrics.forEach(metric => {
        const validation = ValidationService.validateMetric(metric);

        stagedMetricsToInsert.push({
          metric_name: metric.name,
          measure_description: metric.measure_description,
          frequency: metric.frequency,
          baseline_value: metric.baseline_value,
          time_series_data: metric.time_series,
          symbol: metric.symbol,
          validation_status: validation.status,
          validation_messages: validation.messages,
          is_mapped: false,
          action: 'create',
          // The server will match these to staged goals by row_number
          _row_number: goal.row_number,
        });
      });
    });

    // Send to server for staging
    return apiPost<{ stagedGoals: StagedGoal[]; stagedMetrics: StagedMetric[] }>(
      `/imports/sessions/${sessionId}/stage`,
      { goals: stagedGoalsToInsert, metrics: stagedMetricsToInsert }
    );
  }

  /**
   * Get staged data for a session
   */
  static async getStagedData(sessionId: string): Promise<{
    goals: StagedGoal[];
    metrics: StagedMetric[];
  }> {
    return apiGet(`/imports/sessions/${sessionId}/staged`);
  }

  /**
   * Update a staged goal
   */
  static async updateStagedGoal(
    stagedGoalId: string,
    updates: Partial<StagedGoal>,
    sessionId?: string
  ): Promise<StagedGoal> {
    // Use the session-scoped route if sessionId provided
    if (sessionId) {
      return apiPut<StagedGoal>(
        `/imports/sessions/${sessionId}/staged-goals/${stagedGoalId}`,
        updates
      );
    }
    return apiPut<StagedGoal>(`/imports/staged-goals/${stagedGoalId}`, updates);
  }

  /**
   * Execute import - move staged data to production tables
   */
  static async executeImport(
    sessionId: string,
    districtId: string,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportSummary> {
    // Show loading state via onProgress
    if (onProgress) {
      onProgress({
        stage: 'importing',
        currentItem: 0,
        totalItems: 0,
        message: 'Starting import...'
      });
    }

    return apiPost<ImportSummary>(`/imports/sessions/${sessionId}/execute`, {
      district_id: districtId,
    });
  }

  /**
   * Get import session by ID
   */
  static async getSession(sessionId: string): Promise<ImportSession | null> {
    try {
      return await apiGet<ImportSession>(`/imports/sessions/${sessionId}`);
    } catch {
      console.error('Error fetching import session');
      return null;
    }
  }

  /**
   * Get all sessions for a district
   */
  static async getSessionsByDistrict(districtId: string): Promise<ImportSession[]> {
    return apiGet<ImportSession[]>('/imports/sessions', { orgId: districtId });
  }

  /**
   * Delete an import session and all staged data
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await apiDelete(`/imports/sessions/${sessionId}`);
  }
}
