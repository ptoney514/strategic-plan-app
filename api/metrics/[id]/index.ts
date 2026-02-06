import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { metrics } from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { getOrgSlugForMetric, isPublicOrg } from "../../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../../lib/response";

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

/**
 * GET /api/metrics/[id] - Get a metric by ID
 */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Metric ID is required", 400);

    const [metric] = await db
      .select()
      .from(metrics)
      .where(eq(metrics.id, id))
      .limit(1);

    if (!metric) return jsonError("Metric not found", 404);

    // Access check: allow if org is public, otherwise require auth + membership
    const lookup = await getOrgSlugForMetric(id);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireOrgMember(req, lookup.orgSlug, "viewer");
      }
    }

    return jsonOk(metricToSnake(metric));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * PUT /api/metrics/[id] - Update a metric
 * Requires auth + org membership (editor role minimum)
 */
export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Metric ID is required", 400);

    // Look up metric -> goal -> plan -> org to verify membership
    const lookup = await getOrgSlugForMetric(id);
    if (!lookup) return jsonError("Metric not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "editor");

    const body = await req.json();

    const updateData: Partial<typeof metrics.$inferInsert> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.metric_name !== undefined) updateData.metricName = body.metric_name;
    if (body.metric_category !== undefined)
      updateData.metricCategory = body.metric_category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.metric_type !== undefined) updateData.metricType = body.metric_type;
    if (body.data_source !== undefined) updateData.dataSource = body.data_source;
    if (body.current_value !== undefined)
      updateData.currentValue = body.current_value;
    if (body.target_value !== undefined) updateData.targetValue = body.target_value;
    if (body.unit !== undefined) updateData.unit = body.unit;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.chart_type !== undefined) updateData.chartType = body.chart_type;
    if (body.display_options !== undefined)
      updateData.displayOptions = body.display_options;
    if (body.order_position !== undefined)
      updateData.orderPosition = body.order_position;
    if (body.display_width !== undefined)
      updateData.displayWidth = body.display_width;
    if (body.display_value !== undefined)
      updateData.displayValue = body.display_value;
    if (body.display_label !== undefined)
      updateData.displayLabel = body.display_label;
    if (body.display_sublabel !== undefined)
      updateData.displaySublabel = body.display_sublabel;
    if (body.visualization_type !== undefined)
      updateData.visualizationType = body.visualization_type;
    if (body.visualization_config !== undefined)
      updateData.visualizationConfig = body.visualization_config;
    if (body.show_target_line !== undefined)
      updateData.showTargetLine = body.show_target_line;
    if (body.show_trend !== undefined) updateData.showTrend = body.show_trend;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.aggregation_method !== undefined)
      updateData.aggregationMethod = body.aggregation_method;
    if (body.decimal_places !== undefined)
      updateData.decimalPlaces = body.decimal_places;
    if (body.is_percentage !== undefined)
      updateData.isPercentage = body.is_percentage;
    if (body.is_higher_better !== undefined)
      updateData.isHigherBetter = body.is_higher_better;
    if (body.ytd_value !== undefined) updateData.ytdValue = body.ytd_value;
    if (body.eoy_projection !== undefined)
      updateData.eoyProjection = body.eoy_projection;
    if (body.last_actual_period !== undefined)
      updateData.lastActualPeriod = body.last_actual_period;
    if (body.risk_threshold_critical !== undefined)
      updateData.riskThresholdCritical = body.risk_threshold_critical;
    if (body.risk_threshold_warning !== undefined)
      updateData.riskThresholdWarning = body.risk_threshold_warning;
    if (body.risk_threshold_off_target !== undefined)
      updateData.riskThresholdOffTarget = body.risk_threshold_off_target;
    if (body.collection_frequency !== undefined)
      updateData.collectionFrequency = body.collection_frequency;
    if (body.baseline_value !== undefined)
      updateData.baselineValue = body.baseline_value;
    if (body.trend_direction !== undefined)
      updateData.trendDirection = body.trend_direction;
    if (body.data_source_details !== undefined)
      updateData.dataSourceDetails = body.data_source_details;
    if (body.last_collected !== undefined)
      updateData.lastCollected = body.last_collected
        ? new Date(body.last_collected)
        : null;
    if (body.measurement_scale !== undefined)
      updateData.measurementScale = body.measurement_scale;
    if (body.ytd_change !== undefined) updateData.ytdChange = body.ytd_change;
    if (body.period_over_period_change !== undefined)
      updateData.periodOverPeriodChange = body.period_over_period_change;
    if (body.period_over_period_percent !== undefined)
      updateData.periodOverPeriodPercent = body.period_over_period_percent;
    if (body.calculation_method !== undefined)
      updateData.calculationMethod = body.calculation_method;
    if (body.data_completeness !== undefined)
      updateData.dataCompleteness = body.data_completeness;
    if (body.confidence_level !== undefined)
      updateData.confidenceLevel = body.confidence_level;
    if (body.last_calculated_at !== undefined)
      updateData.lastCalculatedAt = body.last_calculated_at
        ? new Date(body.last_calculated_at)
        : null;
    if (body.calculation_notes !== undefined)
      updateData.calculationNotes = body.calculation_notes;
    if (body.is_calculated !== undefined)
      updateData.isCalculated = body.is_calculated;
    if (body.calculation_formula !== undefined)
      updateData.calculationFormula = body.calculation_formula;
    if (body.date_range_start !== undefined)
      updateData.dateRangeStart = body.date_range_start;
    if (body.date_range_end !== undefined)
      updateData.dateRangeEnd = body.date_range_end;
    if (body.metric_data_type !== undefined)
      updateData.metricDataType = body.metric_data_type;
    if (body.metric_calculation_type !== undefined)
      updateData.metricCalculationType = body.metric_calculation_type;
    if (body.qualitative_mapping !== undefined)
      updateData.qualitativeMapping = body.qualitative_mapping;

    const [updated] = await db
      .update(metrics)
      .set(updateData)
      .where(eq(metrics.id, id))
      .returning();

    return jsonOk(metricToSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * DELETE /api/metrics/[id] - Delete a metric
 * Requires auth + org membership (admin role)
 */
export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Metric ID is required", 400);

    // Look up metric -> goal -> plan -> org to verify membership
    const lookup = await getOrgSlugForMetric(id);
    if (!lookup) return jsonError("Metric not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "admin");

    await db.delete(metrics).where(eq(metrics.id, id));

    return jsonOk({ deleted: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
