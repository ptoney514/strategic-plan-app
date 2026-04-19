import { eq, and, count } from "drizzle-orm";
import { db } from "@api/lib/db";
import { plans, goals } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { getOrgSlugForPlan, isPublicOrg } from "@api/lib/helpers/org-lookup";
import { jsonOk, jsonError } from "@api/lib/response";

function toSnake(row: typeof plans.$inferSelect) {
  return {
    id: row.id,
    organization_id: row.organizationId,
    district_id: row.organizationId,
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
    public_template: row.publicTemplate,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

/**
 * GET /api/plans/[id]/summary - Get plan with aggregate counts
 * Returns plan data plus objective_count, goal_count
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    return jsonOk({
      ...toSnake(plan),
      objective_count: objectiveResult.value,
      goal_count: goalResult.value,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
