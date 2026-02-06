import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db";
import {
  goals,
  metrics,
  plans,
  organizations,
  organizationMembers,
} from "../../lib/schema/index";
import { requireAuth } from "../../lib/middleware/auth";
import { hasMinimumRole } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goalToSnake(g: Record<string, unknown>) {
  return {
    id: g.id,
    plan_id: g.planId,
    organization_id: g.organizationId,
    district_id: g.organizationId,
    school_id: g.schoolId,
    parent_id: g.parentId,
    goal_number: g.goalNumber,
    title: g.title,
    description: g.description,
    level: g.level,
    order_position: g.orderPosition,
    status: g.status,
    calculated_status: g.calculatedStatus,
    status_source: g.statusSource,
    status_override_reason: g.statusOverrideReason,
    status_override_by: g.statusOverrideBy,
    status_override_at: g.statusOverrideAt,
    status_override_expires: g.statusOverrideExpires,
    status_calculation_confidence: g.statusCalculationConfidence,
    status_last_calculated: g.statusLastCalculated,
    overall_progress: g.overallProgress,
    overall_progress_override: g.overallProgressOverride,
    overall_progress_custom_value: g.overallProgressCustomValue,
    overall_progress_display_mode: g.overallProgressDisplayMode,
    overall_progress_source: g.overallProgressSource,
    overall_progress_last_calculated: g.overallProgressLastCalculated,
    overall_progress_override_by: g.overallProgressOverrideBy,
    overall_progress_override_at: g.overallProgressOverrideAt,
    overall_progress_override_reason: g.overallProgressOverrideReason,
    image_url: g.imageUrl,
    header_color: g.headerColor,
    cover_photo_url: g.coverPhotoUrl,
    cover_photo_alt: g.coverPhotoAlt,
    color: g.color,
    show_progress_bar: g.showProgressBar,
    owner_name: g.ownerName,
    department: g.department,
    start_date: g.startDate,
    end_date: g.endDate,
    priority: g.priority,
    executive_summary: g.executiveSummary,
    indicator_text: g.indicatorText,
    indicator_color: g.indicatorColor,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

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

function extractId(req: Request): string {
  return new URL(req.url).pathname.split("/")[3];
}

/**
 * Look up the organization that owns a goal (goal -> plan -> organization).
 * Returns the organization row or throws 404.
 */
async function getGoalOrg(goalRow: { planId: string }) {
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

  return org;
}

/**
 * Verify that user has at least `minimumRole` in the organization.
 * System admins bypass the check.
 */
async function requireGoalOrgMember(
  req: Request,
  goalRow: { planId: string },
  minimumRole: "viewer" | "editor" | "admin" | "owner",
) {
  const { user, session } = await requireAuth(req);
  const org = await getGoalOrg(goalRow);

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
// GET /api/goals/:id — Get goal by ID with its metrics
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    const id = extractId(req);

    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!goal) {
      return jsonError("Goal not found", 404);
    }

    const goalMetrics = await db
      .select()
      .from(metrics)
      .where(eq(metrics.goalId, id))
      .orderBy(metrics.orderPosition, metrics.createdAt);

    return jsonOk({
      ...goalToSnake(goal),
      metrics: goalMetrics.map(metricToSnake),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/goals/:id — Update goal (requires editor role)
// ---------------------------------------------------------------------------

export async function PUT(req: Request) {
  try {
    const id = extractId(req);

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    await requireGoalOrgMember(req, existing, "editor");

    const body = await req.json();

    // Build the update object from snake_case body -> camelCase columns
    const updateData: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      plan_id: "planId",
      organization_id: "organizationId",
      school_id: "schoolId",
      parent_id: "parentId",
      goal_number: "goalNumber",
      title: "title",
      description: "description",
      level: "level",
      order_position: "orderPosition",
      status: "status",
      calculated_status: "calculatedStatus",
      status_source: "statusSource",
      status_override_reason: "statusOverrideReason",
      status_override_by: "statusOverrideBy",
      status_override_at: "statusOverrideAt",
      status_override_expires: "statusOverrideExpires",
      status_calculation_confidence: "statusCalculationConfidence",
      status_last_calculated: "statusLastCalculated",
      overall_progress: "overallProgress",
      overall_progress_override: "overallProgressOverride",
      overall_progress_custom_value: "overallProgressCustomValue",
      overall_progress_display_mode: "overallProgressDisplayMode",
      overall_progress_source: "overallProgressSource",
      overall_progress_last_calculated: "overallProgressLastCalculated",
      overall_progress_override_by: "overallProgressOverrideBy",
      overall_progress_override_at: "overallProgressOverrideAt",
      overall_progress_override_reason: "overallProgressOverrideReason",
      image_url: "imageUrl",
      header_color: "headerColor",
      cover_photo_url: "coverPhotoUrl",
      cover_photo_alt: "coverPhotoAlt",
      color: "color",
      show_progress_bar: "showProgressBar",
      owner_name: "ownerName",
      department: "department",
      start_date: "startDate",
      end_date: "endDate",
      priority: "priority",
      executive_summary: "executiveSummary",
      indicator_text: "indicatorText",
      indicator_color: "indicatorColor",
    };

    for (const [snakeKey, camelKey] of Object.entries(fieldMap)) {
      if (snakeKey in body) {
        updateData[camelKey] = body[snakeKey];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const [updated] = await db
      .update(goals)
      .set(updateData)
      .where(eq(goals.id, id))
      .returning();

    return jsonOk(goalToSnake(updated));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/goals/:id — Delete goal (requires admin role)
// ---------------------------------------------------------------------------

export async function DELETE(req: Request) {
  try {
    const id = extractId(req);

    const [existing] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!existing) {
      return jsonError("Goal not found", 404);
    }

    await requireGoalOrgMember(req, existing, "admin");

    await db.delete(goals).where(eq(goals.id, id));

    return jsonOk({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
