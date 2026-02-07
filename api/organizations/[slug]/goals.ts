import { eq, and, sql, asc } from "drizzle-orm";
import { db } from "../../lib/db";
import { organizations, plans, goals, metrics } from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { jsonOk, jsonError, parsePagination } from "../../lib/response";

/** Map a Drizzle goal row to snake_case for the frontend */
function goalToSnakeCase(
  goal: typeof goals.$inferSelect,
  metricsCount: number,
) {
  return {
    id: goal.id,
    plan_id: goal.planId,
    organization_id: goal.organizationId,
    district_id: goal.organizationId,
    school_id: goal.schoolId,
    parent_id: goal.parentId,
    goal_number: goal.goalNumber,
    title: goal.title,
    description: goal.description,
    level: goal.level,
    order_position: goal.orderPosition,
    status: goal.status,
    calculated_status: goal.calculatedStatus,
    status_source: goal.statusSource,
    status_override_reason: goal.statusOverrideReason,
    status_override_by: goal.statusOverrideBy,
    status_override_at: goal.statusOverrideAt?.toISOString() ?? null,
    status_override_expires: goal.statusOverrideExpires?.toISOString() ?? null,
    status_calculation_confidence: goal.statusCalculationConfidence,
    status_last_calculated: goal.statusLastCalculated?.toISOString() ?? null,
    overall_progress: goal.overallProgress,
    overall_progress_override: goal.overallProgressOverride,
    overall_progress_custom_value: goal.overallProgressCustomValue,
    overall_progress_display_mode: goal.overallProgressDisplayMode,
    overall_progress_source: goal.overallProgressSource,
    overall_progress_last_calculated:
      goal.overallProgressLastCalculated?.toISOString() ?? null,
    overall_progress_override_by: goal.overallProgressOverrideBy,
    overall_progress_override_at:
      goal.overallProgressOverrideAt?.toISOString() ?? null,
    overall_progress_override_reason: goal.overallProgressOverrideReason,
    image_url: goal.imageUrl,
    header_color: goal.headerColor,
    cover_photo_url: goal.coverPhotoUrl,
    cover_photo_alt: goal.coverPhotoAlt,
    color: goal.color,
    show_progress_bar: goal.showProgressBar,
    owner_name: goal.ownerName,
    department: goal.department,
    start_date: goal.startDate,
    end_date: goal.endDate,
    priority: goal.priority,
    executive_summary: goal.executiveSummary,
    indicator_text: goal.indicatorText,
    indicator_color: goal.indicatorColor,
    created_at: goal.createdAt?.toISOString() ?? null,
    updated_at: goal.updatedAt?.toISOString() ?? null,
    metrics_count: metricsCount,
  };
}

/** Extract the org slug from the URL path: /api/organizations/[slug]/goals */
function getSlugFromUrl(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[3];
}

/**
 * GET /api/organizations/[slug]/goals
 * Get all goals for the organization (flat list for dashboard view).
 * Joins through plans to get goals belonging to the org.
 * Query params:
 *   ?level=0       -> filter by goal level (0, 1, 2)
 *   ?planId=uuid   -> filter by specific plan
 * Includes metrics_count per goal.
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
    const filterLevel = url.searchParams.get("level");
    const filterPlanId = url.searchParams.get("planId");
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

    // Build conditions: goals must belong to plans owned by this org
    const conditions = [eq(plans.organizationId, org.id)];

    if (filterLevel !== null && filterLevel !== undefined) {
      const level = parseInt(filterLevel, 10);
      if (!isNaN(level)) {
        conditions.push(eq(goals.level, level));
      }
    }

    if (filterPlanId) {
      conditions.push(eq(goals.planId, filterPlanId));
    }

    // Query goals joined to plans, with a subquery count of metrics per goal
    const metricsCountSubquery = db
      .select({
        goalId: metrics.goalId,
        count: sql<number>`cast(count(*) as int)`.as("metrics_count"),
      })
      .from(metrics)
      .groupBy(metrics.goalId)
      .as("metrics_count_sq");

    const rows = await db
      .select({
        goal: goals,
        metricsCount: sql<number>`coalesce(${metricsCountSubquery.count}, 0)`,
      })
      .from(goals)
      .innerJoin(plans, eq(goals.planId, plans.id))
      .leftJoin(
        metricsCountSubquery,
        eq(goals.id, metricsCountSubquery.goalId),
      )
      .where(and(...conditions))
      .orderBy(asc(goals.level), asc(goals.orderPosition), asc(goals.createdAt))
      .limit(limit)
      .offset(offset);

    return jsonOk(
      rows.map((r) => goalToSnakeCase(r.goal, Number(r.metricsCount ?? 0))),
    );
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
