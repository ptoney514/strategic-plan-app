import { eq, and, count } from "drizzle-orm";
import { db } from "../../lib/db";
import { plans, goals, metrics } from "../../lib/schema/index";
import { requireOrgMember } from "../../lib/middleware/auth";
import { getOrgSlugForPlan, isPublicOrg } from "../../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../../lib/response";

export const config = { runtime: "edge" };

function toSnake(row: typeof plans.$inferSelect) {
  return {
    id: row.id,
    organization_id: row.organizationId,
    district_id: row.organizationId,
    school_id: row.schoolId,
    name: row.name,
    slug: row.slug,
    type_label: row.typeLabel,
    description: row.description,
    cover_image_url: row.coverImageUrl,
    is_public: row.isPublic,
    is_active: row.isActive,
    start_date: row.startDate,
    end_date: row.endDate,
    order_position: row.orderPosition,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/**
 * GET /api/plans/[id]/summary - Get plan with aggregate counts
 * Returns plan data plus objective_count, goal_count, metric_count
 */
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    // Fetch the plan
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);

    if (!plan) return jsonError("Plan not found", 404);

    // Access check: allow if org is public, otherwise require org membership
    const lookup = await getOrgSlugForPlan(id);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireOrgMember(req, lookup.orgSlug, "viewer");
      }
    }

    // Count level-0 goals (objectives)
    const [objectiveResult] = await db
      .select({ value: count() })
      .from(goals)
      .where(and(eq(goals.planId, id), eq(goals.level, 0)));

    // Count level-1 goals
    const [goalResult] = await db
      .select({ value: count() })
      .from(goals)
      .where(and(eq(goals.planId, id), eq(goals.level, 1)));

    // Count all metrics across all plan goals
    const [metricResult] = await db
      .select({ value: count() })
      .from(metrics)
      .innerJoin(goals, eq(metrics.goalId, goals.id))
      .where(eq(goals.planId, id));

    return jsonOk({
      ...toSnake(plan),
      objective_count: objectiveResult.value,
      goal_count: goalResult.value,
      metric_count: metricResult.value,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
