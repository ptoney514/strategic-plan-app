import { eq, and, isNull, asc } from "drizzle-orm";
import { db } from "../lib/db";
import { goals } from "../lib/schema/index";
import { requireOrgMember } from "../lib/middleware/auth";
import { getOrgSlugForPlan } from "../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

// ---------------------------------------------------------------------------
// PUT /api/goals/renumber — Renumber goals sequentially
// ---------------------------------------------------------------------------

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.planId && !body.plan_id) {
      return jsonError("plan_id is required", 400);
    }

    const planId = body.planId || body.plan_id;

    // Verify org membership via plan
    const lookup = await getOrgSlugForPlan(planId);
    if (!lookup) return jsonError("Plan not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "editor");
    const parentId = body.parentId || body.parent_id || null;

    // Determine the numbering prefix from parent goal
    let prefix = "";
    if (parentId) {
      const [parent] = await db
        .select({ goalNumber: goals.goalNumber })
        .from(goals)
        .where(eq(goals.id, parentId))
        .limit(1);

      if (!parent) {
        return jsonError("Parent goal not found", 404);
      }

      prefix = parent.goalNumber + ".";
    }

    // Query goals by planId and parentId, ordered by orderPosition
    const conditions = parentId
      ? and(eq(goals.planId, planId), eq(goals.parentId, parentId))
      : and(eq(goals.planId, planId), isNull(goals.parentId));

    const goalsToRenumber = await db
      .select({ id: goals.id })
      .from(goals)
      .where(conditions)
      .orderBy(asc(goals.orderPosition));

    if (goalsToRenumber.length === 0) {
      return jsonOk({ success: true, updated: 0 });
    }

    // Renumber sequentially: "1", "2", "3" (top-level) or "X.1", "X.2" (children)
    const updates = goalsToRenumber.map((goal, index) =>
      db
        .update(goals)
        .set({ goalNumber: `${prefix}${index + 1}` })
        .where(eq(goals.id, goal.id)),
    );

    await Promise.all(updates);

    return jsonOk({
      success: true,
      updated: goalsToRenumber.length,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
