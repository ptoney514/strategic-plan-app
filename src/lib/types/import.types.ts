/**
 * Types for Excel import system
 */

export type ImportStatus = 'uploaded' | 'parsing' | 'parsed' | 'mapping' | 'importing' | 'completed' | 'failed';
export type ValidationStatus = 'valid' | 'warning' | 'error' | 'fixable';
export type ImportAction = 'create' | 'update' | 'skip';
export type AutoFixType = 'create-parent' | 'merge-duplicate' | 'fix-format';

export interface ImportSession {
  id: string;
  district_id: string;
  filename: string;
  file_size?: number;
  status: ImportStatus;
  uploaded_by?: string;
  uploaded_at: string;
  completed_at?: string;
  error_message?: string;
  import_summary?: ImportSummary;
  created_at: string;
  updated_at: string;
}

export interface ImportSummary {
  goals_created: number;
  goals_updated: number;
  metrics_created: number;
  metrics_updated: number;
  errors: number;
  warnings: number;
}

export interface StagedGoal {
  id: string;
  import_session_id: string;
  row_number: number;
  raw_data: Record<string, any>;
  parsed_hierarchy?: string; // "|1.1.1|"
  goal_number?: string; // "1.1.1"
  title?: string;
  description?: string;
  level?: 0 | 1 | 2;
  owner_name?: string;
  department?: string;
  validation_status: ValidationStatus;
  validation_messages: string[];
  is_mapped: boolean;
  mapped_to_goal_id?: string;
  action: ImportAction;
  is_auto_generated?: boolean;
  auto_fix_suggestions?: AutoFixSuggestion[];
  created_at: string;
  updated_at: string;
}

export interface StagedMetric {
  id: string;
  staged_goal_id: string;
  import_session_id: string;
  metric_name: string;
  measure_description?: string;
  metric_type?: string;
  data_source?: string;
  frequency?: string;
  baseline_value?: number;
  time_series_data?: TimeSeriesEntry[];
  unit?: string;
  symbol?: string; // "%", "$", "Number", etc.
  validation_status: ValidationStatus;
  validation_messages: string[];
  is_mapped: boolean;
  mapped_to_metric_id?: string;
  action: ImportAction;
  created_at: string;
  updated_at: string;
}

export interface TimeSeriesEntry {
  period: string; // "2022-06", "2022-Q1", "2023"
  target?: number;
  actual?: number;
  label?: string; // "June 2022", "Q1 2022"
}

export interface ParsedExcelData {
  goals: ParsedGoal[];
  sheetName: string;
  rowCount: number;
}

export interface ParsedGoal {
  row_number: number;
  raw_data: Record<string, any>;
  hierarchy: string; // "|1.1.1|"
  goal_number: string; // "1.1.1"
  title: string;
  description?: string;
  level: 0 | 1 | 2;
  owner_name?: string;
  metrics: ParsedMetric[];
}

export interface ParsedMetric {
  name: string;
  measure_description: string;
  baseline_value?: number;
  symbol?: string;
  frequency?: string;
  time_series: TimeSeriesEntry[];
}

export interface FieldMapping {
  excelColumn: string;
  databaseField: string;
  confidence: number; // 0-1
  isAutoDetected: boolean;
}

export interface ValidationResult {
  status: ValidationStatus;
  messages: string[];
  autoFixSuggestions?: AutoFixSuggestion[];
}

export interface AutoFixSuggestion {
  type: AutoFixType;
  affectedGoalId?: string;
  missingGoalNumber?: string;
  suggestedTitle?: string;
  suggestedOwner?: string;
  suggestedLevel?: 0 | 1 | 2;
  action: string; // Human-readable description
  data?: any; // Additional context
}

export interface ImportProgress {
  stage: 'parsing' | 'validating' | 'importing';
  currentItem: number;
  totalItems: number;
  message: string;
}
