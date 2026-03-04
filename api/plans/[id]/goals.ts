import { eq, asc } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { plans, goals, organizations } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { getOrgSlugForPlan, isPublicOrg } from "../../lib/helpers/org-lookup.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
function goalToSnake(row: any) {
  return {
    id: row.id,
    plan_id: row.planId,
    organization_id: row.organizationId,
    district_id: row.organizationId,
    parent_id: row.parentId,
    goal_number: row.goalNumber,
    title: row.title,
    description: row.description,
    level: row.level,
    order_position: row.orderPosition,
    status: row.status,
    overall_progress: row.overallProgress,
    overall_progress_display_mode: row.overallProgressDisplayMode,
    owner_name: row.ownerName,
    priority: row.priority,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * GET /api/plans/[id]/goals - Get all goals for a plan
 * Returns a flat list ordered by goal_number; frontend builds hierarchy.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/")[3];
    if (!id) return jsonError("Plan ID is required", 400);

    // Verify plan exists
    const [plan] = await db
      .select({ id: plans.id })
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

    // Get all goals for this plan, ordered by goal_number
    const planGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.planId, id))
      .orderBy(asc(goals.goalNumber));

    return jsonOk(planGoals.map(goalToSnake));
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
      ownerName: body.owner_name ?? null,
      priority: body.priority ?? null,
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
