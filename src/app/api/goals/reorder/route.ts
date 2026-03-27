import { eq, inArray } from "drizzle-orm";
import { db } from "@api/lib/db";
import { goals, plans } from "@api/lib/schema/index";
import { requireOrgMember } from "@api/lib/middleware/auth";
import { getOrgSlugForGoal } from "@api/lib/helpers/org-lookup";
import { jsonOk, jsonError } from "@api/lib/response";

// ---------------------------------------------------------------------------
// PUT /api/goals/reorder — Reorder goals by updating order_position
// ---------------------------------------------------------------------------

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.goals || !Array.isArray(body.goals) || body.goals.length === 0) {
      return jsonError(
        "Request body must contain a non-empty goals array",
        400,
      );
    }

    // Validate each entry has id and order_position
    for (const entry of body.goals) {
      if (!entry.id || entry.order_position === undefined) {
        return jsonError(
          "Each goal entry must have id and order_position",
          400,
        );
      }
    }

    // Look up org for the first goal and verify membership
    const lookup = await getOrgSlugForGoal(body.goals[0].id);
    if (!lookup) return jsonError("Goal not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "editor");

    // Verify all goals belong to the same plan (same org)
    if (body.goals.length > 1) {
      const goalIds = body.goals.map((e: { id: string }) => e.id);
      const rows = await db
        .select({ id: goals.id, planId: goals.planId })
        .from(goals)
        .where(inArray(goals.id, goalIds));

      const planIds = new Set(rows.map((r) => r.planId));
      if (planIds.size > 1) {
        // Verify all plans belong to the same org
        const planRows = await db
          .select({ orgId: plans.organizationId })
          .from(plans)
          .where(inArray(plans.id, [...planIds]));
        const orgIds = new Set(planRows.map((r) => r.orgId));
        if (orgIds.size > 1) {
          return jsonError("All goals must belong to the same organization", 403);
        }
      }
    }

    // Update each goal's orderPosition
    const updates = body.goals.map(
      (entry: { id: string; order_position: number }) =>
        db
          .update(goals)
          .set({ orderPosition: entry.order_position })
          .where(eq(goals.id, entry.id)),
    );

    await Promise.all(updates);

    return jsonOk({ success: true, updated: body.goals.length });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
