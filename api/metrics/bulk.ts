import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import {
  metrics,
  goals,
  plans,
  organizations,
} from "../lib/schema/index";
import { requireAuth, requireOrgMember } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle metrics row to snake_case for the frontend */
function metricToSnake(m: typeof metrics.$inferSelect) {
  return {
    id: m.id,
    goal_id: m.goalId,
    name: m.name,
    metric_name: m.metricName,
    metric_category: m.metricCategory,
    description: m.description,
    metric_type: m.metricType,
    data_source: m.dataSource,
    current_value: m.currentValue,
    target_value: m.targetValue,
    unit: m.unit,
    status: m.status,
    chart_type: m.chartType,
    display_options: m.displayOptions,
    order_position: m.orderPosition,
    display_width: m.displayWidth,
    display_value: m.displayValue,
    display_label: m.displayLabel,
    display_sublabel: m.displaySublabel,
    visualization_type: m.visualizationType,
    visualization_config: m.visualizationConfig,
    show_target_line: m.showTargetLine,
    show_trend: m.showTrend,
    frequency: m.frequency,
    aggregation_method: m.aggregationMethod,
    decimal_places: m.decimalPlaces,
    is_percentage: m.isPercentage,
    is_higher_better: m.isHigherBetter,
    ytd_value: m.ytdValue,
    eoy_projection: m.eoyProjection,
    last_actual_period: m.lastActualPeriod,
    risk_threshold_critical: m.riskThresholdCritical,
    risk_threshold_warning: m.riskThresholdWarning,
    risk_threshold_off_target: m.riskThresholdOffTarget,
    collection_frequency: m.collectionFrequency,
    baseline_value: m.baselineValue,
    trend_direction: m.trendDirection,
    data_source_details: m.dataSourceDetails,
    last_collected: m.lastCollected,
    measurement_scale: m.measurementScale,
    ytd_change: m.ytdChange,
    period_over_period_change: m.periodOverPeriodChange,
    period_over_period_percent: m.periodOverPeriodPercent,
    calculation_method: m.calculationMethod,
    data_completeness: m.dataCompleteness,
    confidence_level: m.confidenceLevel,
    last_calculated_at: m.lastCalculatedAt,
    calculation_notes: m.calculationNotes,
    is_calculated: m.isCalculated,
    calculation_formula: m.calculationFormula,
    date_range_start: m.dateRangeStart,
    date_range_end: m.dateRangeEnd,
    metric_data_type: m.metricDataType,
    metric_calculation_type: m.metricCalculationType,
    qualitative_mapping: m.qualitativeMapping,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

/** Look up metric -> goal -> plan -> organization slug */
async function getOrgSlugForMetric(metricId: string) {
  const [row] = await db
    .select({
      metricId: metrics.id,
      orgSlug: organizations.slug,
    })
    .from(metrics)
    .innerJoin(goals, eq(metrics.goalId, goals.id))
    .innerJoin(plans, eq(goals.planId, plans.id))
    .innerJoin(organizations, eq(plans.organizationId, organizations.id))
    .where(eq(metrics.id, metricId))
    .limit(1);

  return row ?? null;
}

/** Build a partial update object from a snake_case body */
function buildUpdateData(
  item: Record<string, unknown>,
): Partial<typeof metrics.$inferInsert> {
  const updateData: Partial<typeof metrics.$inferInsert> = {};
  if (item.name !== undefined) updateData.name = item.name as string;
  if (item.metric_name !== undefined)
    updateData.metricName = item.metric_name as string;
  if (item.metric_category !== undefined)
    updateData.metricCategory = item.metric_category as string;
  if (item.description !== undefined)
    updateData.description = item.description as string;
  if (item.metric_type !== undefined)
    updateData.metricType = item.metric_type as string;
  if (item.data_source !== undefined)
    updateData.dataSource = item.data_source as string;
  if (item.current_value !== undefined)
    updateData.currentValue = item.current_value as string;
  if (item.target_value !== undefined)
    updateData.targetValue = item.target_value as string;
  if (item.unit !== undefined) updateData.unit = item.unit as string;
  if (item.status !== undefined) updateData.status = item.status as string;
  if (item.chart_type !== undefined)
    updateData.chartType = item.chart_type as string;
  if (item.display_options !== undefined)
    updateData.displayOptions = item.display_options;
  if (item.order_position !== undefined)
    updateData.orderPosition = item.order_position as number;
  if (item.display_width !== undefined)
    updateData.displayWidth = item.display_width as string;
  if (item.display_value !== undefined)
    updateData.displayValue = item.display_value as string;
  if (item.display_label !== undefined)
    updateData.displayLabel = item.display_label as string;
  if (item.display_sublabel !== undefined)
    updateData.displaySublabel = item.display_sublabel as string;
  if (item.visualization_type !== undefined)
    updateData.visualizationType = item.visualization_type as string;
  if (item.visualization_config !== undefined)
    updateData.visualizationConfig = item.visualization_config;
  if (item.show_target_line !== undefined)
    updateData.showTargetLine = item.show_target_line as boolean;
  if (item.show_trend !== undefined)
    updateData.showTrend = item.show_trend as boolean;
  if (item.frequency !== undefined)
    updateData.frequency = item.frequency as string;
  if (item.aggregation_method !== undefined)
    updateData.aggregationMethod = item.aggregation_method as string;
  if (item.decimal_places !== undefined)
    updateData.decimalPlaces = item.decimal_places as number;
  if (item.is_percentage !== undefined)
    updateData.isPercentage = item.is_percentage as boolean;
  if (item.is_higher_better !== undefined)
    updateData.isHigherBetter = item.is_higher_better as boolean;
  if (item.ytd_value !== undefined)
    updateData.ytdValue = item.ytd_value as string;
  if (item.eoy_projection !== undefined)
    updateData.eoyProjection = item.eoy_projection as string;
  if (item.last_actual_period !== undefined)
    updateData.lastActualPeriod = item.last_actual_period as string;
  if (item.risk_threshold_critical !== undefined)
    updateData.riskThresholdCritical = item.risk_threshold_critical as string;
  if (item.risk_threshold_warning !== undefined)
    updateData.riskThresholdWarning = item.risk_threshold_warning as string;
  if (item.risk_threshold_off_target !== undefined)
    updateData.riskThresholdOffTarget = item.risk_threshold_off_target as string;
  if (item.collection_frequency !== undefined)
    updateData.collectionFrequency = item.collection_frequency as string;
  if (item.baseline_value !== undefined)
    updateData.baselineValue = item.baseline_value as string;
  if (item.trend_direction !== undefined)
    updateData.trendDirection = item.trend_direction as string;
  if (item.data_source_details !== undefined)
    updateData.dataSourceDetails = item.data_source_details as string;
  if (item.last_collected !== undefined)
    updateData.lastCollected = item.last_collected
      ? new Date(item.last_collected as string)
      : null;
  if (item.measurement_scale !== undefined)
    updateData.measurementScale = item.measurement_scale as string;
  if (item.ytd_change !== undefined)
    updateData.ytdChange = item.ytd_change as string;
  if (item.period_over_period_change !== undefined)
    updateData.periodOverPeriodChange =
      item.period_over_period_change as string;
  if (item.period_over_period_percent !== undefined)
    updateData.periodOverPeriodPercent =
      item.period_over_period_percent as string;
  if (item.calculation_method !== undefined)
    updateData.calculationMethod = item.calculation_method as string;
  if (item.data_completeness !== undefined)
    updateData.dataCompleteness = item.data_completeness as string;
  if (item.confidence_level !== undefined)
    updateData.confidenceLevel = item.confidence_level as string;
  if (item.last_calculated_at !== undefined)
    updateData.lastCalculatedAt = item.last_calculated_at
      ? new Date(item.last_calculated_at as string)
      : null;
  if (item.calculation_notes !== undefined)
    updateData.calculationNotes = item.calculation_notes as string;
  if (item.is_calculated !== undefined)
    updateData.isCalculated = item.is_calculated as boolean;
  if (item.calculation_formula !== undefined)
    updateData.calculationFormula = item.calculation_formula as string;
  if (item.date_range_start !== undefined)
    updateData.dateRangeStart = item.date_range_start as string;
  if (item.date_range_end !== undefined)
    updateData.dateRangeEnd = item.date_range_end as string;
  if (item.metric_data_type !== undefined)
    updateData.metricDataType = item.metric_data_type as string;
  if (item.metric_calculation_type !== undefined)
    updateData.metricCalculationType = item.metric_calculation_type as string;
  if (item.qualitative_mapping !== undefined)
    updateData.qualitativeMapping = item.qualitative_mapping;
  return updateData;
}

/**
 * PUT /api/metrics/bulk - Bulk update metrics
 * Requires auth + org membership (editor role minimum)
 *
 * Body: { metrics: [{ id, ...updates }] }
 */
export async function PUT(req: Request) {
  try {
    await requireAuth(req);

    const body = await req.json();

    if (!Array.isArray(body.metrics) || body.metrics.length === 0) {
      return jsonError("metrics array is required and must not be empty", 400);
    }

    // Validate each entry has an id
    for (const item of body.metrics) {
      if (!item.id) {
        return jsonError("Each metric must have an id", 400);
      }
    }

    // Verify org membership using the first metric in the list
    const lookup = await getOrgSlugForMetric(body.metrics[0].id);
    if (!lookup) return jsonError("Metric not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "editor");

    // Update each metric with provided fields
    const results = await Promise.all(
      body.metrics.map(
        (item: Record<string, unknown> & { id: string }) => {
          const { id, ...rest } = item;
          const updateData = buildUpdateData(rest);

          // Only update if there are fields to update
          if (Object.keys(updateData).length === 0) {
            return db
              .select()
              .from(metrics)
              .where(eq(metrics.id, id))
              .limit(1);
          }

          return db
            .update(metrics)
            .set(updateData)
            .where(eq(metrics.id, id))
            .returning();
        },
      ),
    );

    return jsonOk({
      updated: results.flat().map(metricToSnake),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
