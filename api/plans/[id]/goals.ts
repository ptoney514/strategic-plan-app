import { eq, asc } from "drizzle-orm";
import { db } from "../../lib/db";
import { plans, goals, metrics, organizations } from "../../lib/schema/index";
import { requireAuth, requireOrgMember } from "../../lib/middleware/auth";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

/* eslint-disable @typescript-eslint/no-explicit-any */
function goalToSnake(row: any) {
  return {
    id: row.id,
    plan_id: row.planId,
    organization_id: row.organizationId,
    district_id: row.organizationId,
    school_id: row.schoolId,
    parent_id: row.parentId,
    goal_number: row.goalNumber,
    title: row.title,
    description: row.description,
    level: row.level,
    order_position: row.orderPosition,
    status: row.status,
    calculated_status: row.calculatedStatus,
    status_source: row.statusSource,
    overall_progress: row.overallProgress,
    overall_progress_override: row.overallProgressOverride,
    overall_progress_display_mode: row.overallProgressDisplayMode,
    overall_progress_source: row.overallProgressSource,
    image_url: row.imageUrl,
    header_color: row.headerColor,
    cover_photo_url: row.coverPhotoUrl,
    cover_photo_alt: row.coverPhotoAlt,
    color: row.color,
    show_progress_bar: row.showProgressBar,
    owner_name: row.ownerName,
    department: row.department,
    start_date: row.startDate,
    end_date: row.endDate,
    priority: row.priority,
    executive_summary: row.executiveSummary,
    indicator_text: row.indicatorText,
    indicator_color: row.indicatorColor,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

function metricToSnake(row: any) {
  return {
    id: row.id,
    goal_id: row.goalId,
    name: row.name,
    metric_name: row.metricName,
    metric_category: row.metricCategory,
    description: row.description,
    metric_type: row.metricType,
    data_source: row.dataSource,
    current_value: row.currentValue,
    target_value: row.targetValue,
    unit: row.unit,
    status: row.status,
    chart_type: row.chartType,
    display_options: row.displayOptions,
    order_position: row.orderPosition,
    display_width: row.displayWidth,
    display_value: row.displayValue,
    display_label: row.displayLabel,
    display_sublabel: row.displaySublabel,
    visualization_type: row.visualizationType,
    visualization_config: row.visualizationConfig,
    show_target_line: row.showTargetLine,
    show_trend: row.showTrend,
    frequency: row.frequency,
    aggregation_method: row.aggregationMethod,
    decimal_places: row.decimalPlaces,
    is_percentage: row.isPercentage,
    is_higher_better: row.isHigherBetter,
    ytd_value: row.ytdValue,
    eoy_projection: row.eoyProjection,
    last_actual_period: row.lastActualPeriod,
    baseline_value: row.baselineValue,
    trend_direction: row.trendDirection,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * GET /api/plans/[id]/goals - Get all goals for a plan with their metrics
 * Returns a flat list ordered by goal_number; frontend builds hierarchy.
 */
export async function GET(req: Request) {
  try {
    await requireAuth(req);

    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    // Verify plan exists
    const [plan] = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!plan) return jsonError("Plan not found", 404);

    // Get all goals for this plan, ordered by goal_number
    const planGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.planId, id))
      .orderBy(asc(goals.goalNumber));

    // Get all metrics for these goals in one query
    const goalIds = planGoals.map((g) => g.id);

    let planMetrics: (typeof metrics.$inferSelect)[] = [];
    if (goalIds.length > 0) {
      planMetrics = await db
        .select()
        .from(metrics)
        .innerJoin(goals, eq(metrics.goalId, goals.id))
        .where(eq(goals.planId, id))
        .orderBy(asc(metrics.orderPosition))
        .then((rows) => rows.map((r) => r.metrics));
    }

    // Group metrics by goal_id
    const metricsByGoalId = new Map<string, (typeof metrics.$inferSelect)[]>();
    for (const metric of planMetrics) {
      const existing = metricsByGoalId.get(metric.goalId) || [];
      existing.push(metric);
      metricsByGoalId.set(metric.goalId, existing);
    }

    // Assemble response: each goal with its metrics
    const result = planGoals.map((goal) => ({
      ...goalToSnake(goal),
      metrics: (metricsByGoalId.get(goal.id) || []).map(metricToSnake),
    }));

    return jsonOk(result);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}

/**
 * POST /api/plans/[id]/goals - Create a goal under this plan
 * Requires auth + org membership (editor role minimum)
 */
export async function POST(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    // Look up the plan to find its organization
    const [plan] = await db
      .select({
        id: plans.id,
        organizationId: plans.organizationId,
      })
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!plan) return jsonError("Plan not found", 404);

    // Look up the org slug for permission check
    const [org] = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.id, plan.organizationId))
      .limit(1);

    if (!org) return jsonError("Organization not found", 404);

    await requireOrgMember(req, org.slug, "editor");

    const body = await req.json();

    // Validate required fields
    if (!body.goal_number) return jsonError("goal_number is required", 400);
    if (!body.title) return jsonError("title is required", 400);
    if (body.level === undefined) return jsonError("level is required", 400);

    const insertData: typeof goals.$inferInsert = {
      planId: id,
      goalNumber: body.goal_number,
      title: body.title,
      level: body.level,
      parentId: body.parent_id ?? null,
      description: body.description ?? null,
      orderPosition: body.order_position ?? 0,
      organizationId: body.organization_id ?? plan.organizationId,
      schoolId: body.school_id ?? null,
      ownerName: body.owner_name ?? null,
      department: body.department ?? null,
      priority: body.priority ?? null,
      startDate: body.start_date ?? null,
      endDate: body.end_date ?? null,
      executiveSummary: body.executive_summary ?? null,
      imageUrl: body.image_url ?? null,
      headerColor: body.header_color ?? null,
      coverPhotoUrl: body.cover_photo_url ?? null,
      coverPhotoAlt: body.cover_photo_alt ?? null,
      color: body.color ?? null,
      indicatorText: body.indicator_text ?? null,
      indicatorColor: body.indicator_color ?? null,
    };

    const [created] = await db.insert(goals).values(insertData).returning();

    return jsonOk(goalToSnake(created), 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
