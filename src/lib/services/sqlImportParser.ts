/**
 * SQL Import File Parser
 * Parses SQL INSERT statements to extract staged data for preview/comparison
 */

export interface ParsedGoal {
  id: string;
  district_id: string;
  goal_number: string;
  title: string;
  description: string | null;
  level: number;
  status: string;
  parent_id: string | null;
}

export interface ParsedMetric {
  id: string;
  goal_id: string;
  name: string;
  metric_type: string;
  current_value: number | null;
  target_value: number | null;
  unit: string | null;
  is_higher_better: boolean;
  description: string | null;
  visualization_type: string;
}

export interface ParsedTimeSeries {
  id: string;
  metric_id: string;
  district_id: string;
  period: string;
  period_type: string;
  target_value: number | null;
  actual_value: number | null;
  status: string | null;
}

export interface ParsedImportData {
  goals: ParsedGoal[];
  metrics: ParsedMetric[];
  timeSeries: ParsedTimeSeries[];
  errors: string[];
}

/**
 * Parse a SQL import file and extract goals, metrics, and time series data
 */
export function parseSqlImportFile(sql: string): ParsedImportData {
  const result: ParsedImportData = {
    goals: [],
    metrics: [],
    timeSeries: [],
    errors: []
  };

  try {
    // Extract goal inserts
    result.goals = parseGoalInserts(sql);

    // Extract metric inserts
    result.metrics = parseMetricInserts(sql);

    // Extract time series inserts
    result.timeSeries = parseTimeSeriesInserts(sql);
  } catch (error) {
    result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

/**
 * Parse INSERT statements for spb_goals
 */
function parseGoalInserts(sql: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];

  // Match VALUES tuples for spb_goals - handles multi-row inserts
  // Pattern: ('uuid', 'district_id', 'goal_number', 'title', description, level, 'status', parent_id)
  const valuesPattern = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*(?:''[^']*)*)',\s*(NULL|'[^']*(?:''[^']*)*'),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']+')\)/g;

  // Find sections that are inserting into spb_goals
  const goalSections = sql.split(/INSERT INTO spb_goals/i).slice(1);

  for (const section of goalSections) {
    // Only process until the next major statement
    const sectionEnd = section.search(/;\s*(INSERT|SELECT|CREATE|ALTER|UPDATE|DELETE|--\s*={5,})/i);
    const relevantSection = sectionEnd > 0 ? section.substring(0, sectionEnd) : section;

    let match;
    while ((match = valuesPattern.exec(relevantSection)) !== null) {
      const [, id, district_id, goal_number, rawTitle, rawDescription, level, status, rawParentId] = match;

      goals.push({
        id,
        district_id,
        goal_number,
        title: unescapeSqlString(rawTitle),
        description: rawDescription === 'NULL' ? null : unescapeSqlString(rawDescription.replace(/^'|'$/g, '')),
        level: parseInt(level, 10),
        status,
        parent_id: rawParentId === 'NULL' ? null : rawParentId.replace(/^'|'$/g, '')
      });
    }
  }

  return goals;
}

/**
 * Parse INSERT statements for spb_metrics
 */
function parseMetricInserts(sql: string): ParsedMetric[] {
  const metrics: ParsedMetric[] = [];

  // Match VALUES tuples for spb_metrics
  const valuesPattern = /\('([^']+)',\s*'([^']+)',\s*'([^']*(?:''[^']*)*)',\s*'([^']+)',\s*([\d.]+|NULL),\s*([\d.]+|NULL),\s*'([^']*)',\s*(true|false),\s*'([^']*(?:''[^']*)*)',\s*'([^']+)'\)/g;

  const metricSections = sql.split(/INSERT INTO spb_metrics/i).slice(1);

  for (const section of metricSections) {
    const sectionEnd = section.search(/;\s*(INSERT|SELECT|CREATE|ALTER|UPDATE|DELETE|--\s*={5,})/i);
    const relevantSection = sectionEnd > 0 ? section.substring(0, sectionEnd) : section;

    let match;
    while ((match = valuesPattern.exec(relevantSection)) !== null) {
      const [, id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type] = match;

      metrics.push({
        id,
        goal_id,
        name: unescapeSqlString(name),
        metric_type,
        current_value: current_value === 'NULL' ? null : parseFloat(current_value),
        target_value: target_value === 'NULL' ? null : parseFloat(target_value),
        unit: unit || null,
        is_higher_better: is_higher_better === 'true',
        description: unescapeSqlString(description),
        visualization_type
      });
    }
  }

  return metrics;
}

/**
 * Parse INSERT statements for spb_metric_time_series
 */
function parseTimeSeriesInserts(sql: string): ParsedTimeSeries[] {
  const timeSeries: ParsedTimeSeries[] = [];

  // Match VALUES tuples for time series
  const valuesPattern = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([\d.]+|NULL),\s*([\d.]+|NULL),\s*'([^']+)'\)/g;

  const tsSections = sql.split(/INSERT INTO spb_metric_time_series/i).slice(1);

  for (const section of tsSections) {
    const sectionEnd = section.search(/;\s*(INSERT|SELECT|CREATE|ALTER|UPDATE|DELETE|--\s*={5,})/i);
    const relevantSection = sectionEnd > 0 ? section.substring(0, sectionEnd) : section;

    let match;
    while ((match = valuesPattern.exec(relevantSection)) !== null) {
      const [, id, metric_id, district_id, period, period_type, target_value, actual_value, status] = match;

      timeSeries.push({
        id,
        metric_id,
        district_id,
        period,
        period_type,
        target_value: target_value === 'NULL' ? null : parseFloat(target_value),
        actual_value: actual_value === 'NULL' ? null : parseFloat(actual_value),
        status
      });
    }
  }

  return timeSeries;
}

/**
 * Unescape SQL string (handle '' -> ')
 */
function unescapeSqlString(str: string): string {
  return str.replace(/''/g, "'");
}

/**
 * Compare staged data against live data
 */
export interface ComparisonResult {
  newItems: ParsedGoal[];
  changedItems: { staged: ParsedGoal; live: any; changes: string[] }[];
  conflicts: { staged: ParsedGoal; live: any; reason: string }[];
  unchanged: ParsedGoal[];
}

export function compareGoals(staged: ParsedGoal[], live: any[]): ComparisonResult {
  const result: ComparisonResult = {
    newItems: [],
    changedItems: [],
    conflicts: [],
    unchanged: []
  };

  const liveById = new Map(live.map(g => [g.id, g]));
  const liveByNumber = new Map<string, any[]>();

  // Group live goals by goal_number for conflict detection
  live.forEach(g => {
    const existing = liveByNumber.get(g.goal_number) || [];
    existing.push(g);
    liveByNumber.set(g.goal_number, existing);
  });

  for (const stagedGoal of staged) {
    const liveGoal = liveById.get(stagedGoal.id);

    if (!liveGoal) {
      // Check if there's a conflict by goal_number
      const existingByNumber = liveByNumber.get(stagedGoal.goal_number) || [];
      if (existingByNumber.length > 0) {
        result.conflicts.push({
          staged: stagedGoal,
          live: existingByNumber[0],
          reason: `Goal number "${stagedGoal.goal_number}" already exists with different ID`
        });
      } else {
        result.newItems.push(stagedGoal);
      }
    } else {
      // Check for changes
      const changes: string[] = [];
      if (stagedGoal.title !== liveGoal.title) changes.push('title');
      if (stagedGoal.description !== liveGoal.description) changes.push('description');
      if (stagedGoal.goal_number !== liveGoal.goal_number) changes.push('goal_number');
      if (stagedGoal.status !== liveGoal.status) changes.push('status');

      if (changes.length > 0) {
        result.changedItems.push({ staged: stagedGoal, live: liveGoal, changes });
      } else {
        result.unchanged.push(stagedGoal);
      }
    }
  }

  return result;
}

/**
 * Compare staged metrics against live metrics
 */
export interface MetricComparisonResult {
  newItems: ParsedMetric[];
  changedItems: { staged: ParsedMetric; live: any; changes: string[] }[];
  conflicts: { staged: ParsedMetric; live: any; reason: string }[];
  unchanged: ParsedMetric[];
}

export function compareMetrics(staged: ParsedMetric[], live: any[]): MetricComparisonResult {
  const result: MetricComparisonResult = {
    newItems: [],
    changedItems: [],
    conflicts: [],
    unchanged: []
  };

  const liveById = new Map(live.map(m => [m.id, m]));
  const liveByGoalIdAndName = new Map<string, any[]>();

  // Group live metrics by goal_id + name for conflict detection
  live.forEach(m => {
    const key = `${m.goal_id}:${m.name}`;
    const existing = liveByGoalIdAndName.get(key) || [];
    existing.push(m);
    liveByGoalIdAndName.set(key, existing);
  });

  for (const stagedMetric of staged) {
    const liveMetric = liveById.get(stagedMetric.id);

    if (!liveMetric) {
      // Check if there's a conflict by goal_id + name
      const key = `${stagedMetric.goal_id}:${stagedMetric.name}`;
      const existingByKey = liveByGoalIdAndName.get(key) || [];
      if (existingByKey.length > 0) {
        result.conflicts.push({
          staged: stagedMetric,
          live: existingByKey[0],
          reason: `Metric "${stagedMetric.name}" already exists for this goal with different ID`
        });
      } else {
        result.newItems.push(stagedMetric);
      }
    } else {
      // Check for changes
      const changes: string[] = [];
      if (stagedMetric.name !== liveMetric.name) changes.push('name');
      if (stagedMetric.current_value !== liveMetric.current_value) changes.push('current_value');
      if (stagedMetric.target_value !== liveMetric.target_value) changes.push('target_value');
      if (stagedMetric.metric_type !== liveMetric.metric_type) changes.push('metric_type');
      if (stagedMetric.visualization_type !== liveMetric.visualization_type) changes.push('visualization_type');
      if (stagedMetric.is_higher_better !== liveMetric.is_higher_better) changes.push('is_higher_better');
      if (stagedMetric.unit !== liveMetric.unit) changes.push('unit');

      if (changes.length > 0) {
        result.changedItems.push({ staged: stagedMetric, live: liveMetric, changes });
      } else {
        result.unchanged.push(stagedMetric);
      }
    }
  }

  return result;
}

/**
 * Compare staged time series against live time series
 */
export interface TimeSeriesComparisonResult {
  newItems: ParsedTimeSeries[];
  changedItems: { staged: ParsedTimeSeries; live: any; changes: string[] }[];
  unchanged: ParsedTimeSeries[];
}

export function compareTimeSeries(staged: ParsedTimeSeries[], live: any[]): TimeSeriesComparisonResult {
  const result: TimeSeriesComparisonResult = {
    newItems: [],
    changedItems: [],
    unchanged: []
  };

  const liveById = new Map(live.map(ts => [ts.id, ts]));
  const liveByMetricAndPeriod = new Map(live.map(ts => [`${ts.metric_id}:${ts.period}`, ts]));

  for (const stagedTs of staged) {
    const liveTs = liveById.get(stagedTs.id) || liveByMetricAndPeriod.get(`${stagedTs.metric_id}:${stagedTs.period}`);

    if (!liveTs) {
      result.newItems.push(stagedTs);
    } else {
      // Check for changes
      const changes: string[] = [];
      if (stagedTs.actual_value !== liveTs.actual_value) changes.push('actual_value');
      if (stagedTs.target_value !== liveTs.target_value) changes.push('target_value');
      if (stagedTs.status !== liveTs.status) changes.push('status');

      if (changes.length > 0) {
        result.changedItems.push({ staged: stagedTs, live: liveTs, changes });
      } else {
        result.unchanged.push(stagedTs);
      }
    }
  }

  return result;
}
