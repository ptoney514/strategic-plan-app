import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { goals } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { getOrgSlugForGoal, isPublicOrg } from "../../lib/helpers/org-lookup.js";
import { jsonOk, jsonError } from "../../lib/response.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goalToSnake(g: Record<string, unknown>) {
  return {
    id: g.id,
    plan_id: g.planId,
    organization_id: g.organizationId,
    district_id: g.organizationId,
    parent_id: g.parentId,
    goal_number: g.goalNumber,
    title: g.title,
    description: g.description,
    level: g.level,
    order_position: g.orderPosition,
    status: g.status,
    overall_progress: g.overallProgress,
    overall_progress_display_mode: g.overallProgressDisplayMode,
    owner_name: g.ownerName,
    priority: g.priority,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

function extractId(req: Request): string {
  return new URL(req.url).pathname.split("/")[3];
}

// ---------------------------------------------------------------------------
// GET /api/goals/:id/children — Get child goals of a goal
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  try {
    const id = extractId(req);

    // Verify the parent goal exists
    const [parent] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id))
      .limit(1);

    if (!parent) {
      return jsonError("Goal not found", 404);
    }

    // Access check: allow if org is public, otherwise require org membership
    const lookup = await getOrgSlugForGoal(id);
    if (lookup) {
      const orgIsPublic = await isPublicOrg(lookup.orgId);
      if (!orgIsPublic) {
        await requireOrgMember(req, lookup.orgSlug, "viewer");
      }
    }

    // Fetch children ordered by goalNumber
    const children = await db
      .select()
      .from(goals)
      .where(eq(goals.parentId, id))
      .orderBy(goals.goalNumber);

    return jsonOk(children.map(goalToSnake));
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
