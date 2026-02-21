import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db.js";
import {
  goals,
  metrics,
  plans,
  organizations,
  organizationMembers,
} from "../../lib/schema/index.js";
import { requireAuth, hasMinimumRole } from "../../lib/middleware/auth.js";
import { getOrgSlugForGoal, isPublicOrg } from "../../lib/helpers/org-lookup.js";
import { toNumberOrNull } from "../../lib/helpers/number.js";
import { jsonOk, jsonError } from "../../lib/response.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function metricToSnake(m: Record<string, unknown>) {
  return {
    id: m.id,
    goal_id: m.goalId,
    name: m.name,
    metric_name: m.metricName,
    metric_category: m.metricCategory,
    description: m.description,
    metric_type: m.metricType,
    data_source: m.dataSource,
    current_value: toNumberOrNull(m.currentValue),
    target_value: toNumberOrNull(m.targetValue),
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
    ytd_value: toNumberOrNull(m.ytdValue),
    eoy_projection: toNumberOrNull(m.eoyProjection),
    last_actual_period: m.lastActualPeriod,
    risk_threshold_critical: toNumberOrNull(m.riskThresholdCritical),
    risk_threshold_warning: toNumberOrNull(m.riskThresholdWarning),
    risk_threshold_off_target: toNumberOrNull(m.riskThresholdOffTarget),
    collection_frequency: m.collectionFrequency,
    baseline_value: toNumberOrNull(m.baselineValue),
    trend_direction: m.trendDirection,
    data_source_details: m.dataSourceDetails,
    last_collected: m.lastCollected,
    measurement_scale: m.measurementScale,
    ytd_change: toNumberOrNull(m.ytdChange),
    period_over_period_change: toNumberOrNull(m.periodOverPeriodChange),
    period_over_period_percent: toNumberOrNull(m.periodOverPeriodPercent),
    calculation_method: m.calculationMethod,
    data_completeness: toNumberOrNull(m.dataCompleteness),
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

function extractId(req: Request): string {
  return new URL(req.url).pathname.split("/")[3];
}

/**
 * Look up the organization that owns a goal (goal -> plan -> organization)
 * and verify the user has at least `minimumRole`.
 */
async function requireGoalOrgMember(
  req: Request,
  goalRow: { planId: string },
  minimumRole: "viewer" | "editor" | "admin" | "owner",
) {
  const { user, session } = await requireAuth(req);

  const [plan] = await db
    .select()
    .from(plans)
    .where(eq(plans.id, goalRow.planId))
    .limit(1);

  if (!plan) {
    throw new Response(
      JSON.stringify({ error: "Plan not found for goal" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, plan.organizationId))
    .limit(1);

  if (!org) {
    throw new Response(
      JSON.stringify({ error: "Organization not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  if (user.isSystemAdmin) {
    return { user, session, organization: org };
  }

  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, org.id),
        eq(organizationMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!hasMinimumRole(membership.role, minimumRole)) {
    throw new Response(
      JSON.stringify({ error: "Insufficient permissions" }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  return { user, session, organization: org };
}

// ---------------------------------------------------------------------------
// GET /api/goals/:id/metrics — Get metrics for a goal
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    const id = extractId(req);

    // Verify the goal exists
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!goal) {
      return jsonError("Goal not found", 404);
    }

    // Access check: allow if org is public, otherwise require auth + membership
    const lookup = await getOrgSlugForGoal(id);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireGoalOrgMember(req, goal, "viewer");
      }
    }

    const goalMetrics = await db
      .select()
      .from(metrics)
      .where(eq(metrics.goalId, id))
      .orderBy(metrics.orderPosition, metrics.createdAt);

    return jsonOk(goalMetrics.map(metricToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/goals/:id/metrics — Create a metric under this goal
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const id = extractId(req);

    // Verify the goal exists
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!goal) {
      return jsonError("Goal not found", 404);
    }

    await requireGoalOrgMember(req, goal, "editor");

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.metric_type) {
      return jsonError("name and metric_type are required", 400);
    }

    // Map snake_case body to camelCase for Drizzle insert
    const insertData: Record<string, unknown> = {
      goalId: id,
      name: body.name,
      metricType: body.metric_type,
    };

    const optionalFields: Record<string, string> = {
      metric_name: "metricName",
      metric_category: "metricCategory",
      description: "description",
      data_source: "dataSource",
      current_value: "currentValue",
      target_value: "targetValue",
      unit: "unit",
      status: "status",
      chart_type: "chartType",
      display_options: "displayOptions",
      order_position: "orderPosition",
      display_width: "displayWidth",
      display_value: "displayValue",
      display_label: "displayLabel",
      display_sublabel: "displaySublabel",
      visualization_type: "visualizationType",
      visualization_config: "visualizationConfig",
      show_target_line: "showTargetLine",
      show_trend: "showTrend",
      frequency: "frequency",
      aggregation_method: "aggregationMethod",
      decimal_places: "decimalPlaces",
      is_percentage: "isPercentage",
      is_higher_better: "isHigherBetter",
      ytd_value: "ytdValue",
      eoy_projection: "eoyProjection",
      last_actual_period: "lastActualPeriod",
      risk_threshold_critical: "riskThresholdCritical",
      risk_threshold_warning: "riskThresholdWarning",
      risk_threshold_off_target: "riskThresholdOffTarget",
      collection_frequency: "collectionFrequency",
      baseline_value: "baselineValue",
      trend_direction: "trendDirection",
      data_source_details: "dataSourceDetails",
      last_collected: "lastCollected",
      measurement_scale: "measurementScale",
      ytd_change: "ytdChange",
      period_over_period_change: "periodOverPeriodChange",
      period_over_period_percent: "periodOverPeriodPercent",
      calculation_method: "calculationMethod",
      data_completeness: "dataCompleteness",
      confidence_level: "confidenceLevel",
      last_calculated_at: "lastCalculatedAt",
      calculation_notes: "calculationNotes",
      is_calculated: "isCalculated",
      calculation_formula: "calculationFormula",
      date_range_start: "dateRangeStart",
      date_range_end: "dateRangeEnd",
      metric_data_type: "metricDataType",
      metric_calculation_type: "metricCalculationType",
      qualitative_mapping: "qualitativeMapping",
    };

    for (const [snakeKey, camelKey] of Object.entries(optionalFields)) {
      if (snakeKey in body) {
        insertData[camelKey] = body[snakeKey];
      }
    }

    const [created] = await db
      .insert(metrics)
      .values(insertData as typeof metrics.$inferInsert)
      .returning();

    return jsonOk(metricToSnake(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
