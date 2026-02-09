import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import {
  metrics,
  goals,
  plans,
  organizations,
} from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

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

/**
 * Calculate status based on current_value vs target_value.
 *  - No target -> 'no-data'
 *  - ratio >= 0.7 -> 'on-target'
 *  - ratio >= 0.4 -> 'off-target'
 *  - ratio < 0.4  -> 'critical'
 */
function calculateStatus(
  currentValue: number,
  targetValue: string | null,
): string {
  if (!targetValue) return "no-data";

  const target = parseFloat(targetValue);
  if (isNaN(target) || target === 0) return "no-data";

  const ratio = currentValue / target;

  if (ratio >= 0.7) return "on-target";
  if (ratio >= 0.4) return "off-target";
  return "critical";
}

/**
 * PUT /api/metrics/[id]/value - Update metric value and auto-calculate status
 * Requires auth + org membership (editor role minimum)
 *
 * Body: { current_value: number }
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

    if (body.current_value === undefined || body.current_value === null) {
      return jsonError("current_value is required", 400);
    }

    const currentValue = Number(body.current_value);
    if (isNaN(currentValue)) {
      return jsonError("current_value must be a number", 400);
    }

    // Fetch existing metric to get target_value
    const [existing] = await db
      .select({ targetValue: metrics.targetValue })
      .from(metrics)
      .where(eq(metrics.id, id))
      .limit(1);

    if (!existing) return jsonError("Metric not found", 404);

    const status = calculateStatus(currentValue, existing.targetValue);

    const [updated] = await db
      .update(metrics)
      .set({
        currentValue: String(currentValue),
        status,
      })
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
