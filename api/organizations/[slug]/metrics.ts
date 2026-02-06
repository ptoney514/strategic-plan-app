import { eq, and, asc } from "drizzle-orm";
import { db } from "../../lib/db";
import { organizations, plans, goals, metrics } from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "../../lib/response";

export const config = { runtime: "edge" };

/** Map a Drizzle metric row to snake_case for the frontend */
function metricToSnakeCase(metric: typeof metrics.$inferSelect) {
  return {
    id: metric.id,
    goal_id: metric.goalId,
    name: metric.name,
    metric_name: metric.metricName,
    metric_category: metric.metricCategory,
    description: metric.description,
    metric_type: metric.metricType,
    data_source: metric.dataSource,
    current_value: metric.currentValue,
    target_value: metric.targetValue,
    unit: metric.unit,
    status: metric.status,
    chart_type: metric.chartType,
    display_options: metric.displayOptions,
    order_position: metric.orderPosition,
    display_width: metric.displayWidth,
    display_value: metric.displayValue,
    display_label: metric.displayLabel,
    display_sublabel: metric.displaySublabel,
    visualization_type: metric.visualizationType,
    visualization_config: metric.visualizationConfig,
    show_target_line: metric.showTargetLine,
    show_trend: metric.showTrend,
    frequency: metric.frequency,
    aggregation_method: metric.aggregationMethod,
    decimal_places: metric.decimalPlaces,
    is_percentage: metric.isPercentage,
    is_higher_better: metric.isHigherBetter,
    ytd_value: metric.ytdValue,
    eoy_projection: metric.eoyProjection,
    last_actual_period: metric.lastActualPeriod,
    risk_threshold_critical: metric.riskThresholdCritical,
    risk_threshold_warning: metric.riskThresholdWarning,
    risk_threshold_off_target: metric.riskThresholdOffTarget,
    collection_frequency: metric.collectionFrequency,
    baseline_value: metric.baselineValue,
    trend_direction: metric.trendDirection,
    data_source_details: metric.dataSourceDetails,
    last_collected: metric.lastCollected?.toISOString() ?? null,
    measurement_scale: metric.measurementScale,
    ytd_change: metric.ytdChange,
    period_over_period_change: metric.periodOverPeriodChange,
    period_over_period_percent: metric.periodOverPeriodPercent,
    calculation_method: metric.calculationMethod,
    data_completeness: metric.dataCompleteness,
    confidence_level: metric.confidenceLevel,
    last_calculated_at: metric.lastCalculatedAt?.toISOString() ?? null,
    calculation_notes: metric.calculationNotes,
    is_calculated: metric.isCalculated,
    calculation_formula: metric.calculationFormula,
    date_range_start: metric.dateRangeStart,
    date_range_end: metric.dateRangeEnd,
    metric_data_type: metric.metricDataType,
    metric_calculation_type: metric.metricCalculationType,
    qualitative_mapping: metric.qualitativeMapping,
    created_at: metric.createdAt?.toISOString() ?? null,
    updated_at: metric.updatedAt?.toISOString() ?? null,
  };
}

/** Extract the org slug from the URL path: /api/organizations/[slug]/metrics */
function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/metrics
 * Get all metrics for the organization.
 * Joins through goals -> plans to filter by org.
 * Returns a flat list of metrics.
 *
 * If the org is public, no auth required. Otherwise require membership.
 */
export async function GET(req: Request) {
  try {
    const slug = getSlugFromUrl(req);
    if (!slug) {
      return jsonError("Organization slug is required", 400);
    }

    const url = new URL(req.url);
    const { limit, offset } = parsePagination(url);

    // Look up the org
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!org) {
      return jsonError("Organization not found", 404);
    }

    // If org is private, require auth + membership
    if (!org.isPublic) {
      await requireOrgMember(req, slug);
    }

    // Query: metrics -> goals -> plans, filtered by org
    const rows = await db
      .select({ metric: metrics })
      .from(metrics)
      .innerJoin(goals, eq(metrics.goalId, goals.id))
      .innerJoin(plans, eq(goals.planId, plans.id))
      .where(eq(plans.organizationId, org.id))
      .orderBy(asc(metrics.orderPosition), asc(metrics.createdAt))
      .limit(limit)
      .offset(offset);

    return jsonOk(rows.map((r) => metricToSnakeCase(r.metric)));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
