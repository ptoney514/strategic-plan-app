import { eq, inArray } from "drizzle-orm";
import { db } from "../lib/db.js";
import { plans } from "../lib/schema/index.js";
import { requireOrgMember } from "../lib/middleware/auth.js";
import { getOrgSlugForPlan } from "../lib/helpers/org-lookup.js";
import { jsonOk, jsonError } from "../lib/response.js";

/**
 * PUT /api/plans/reorder - Reorder plans by updating order_position
 * Body: { plans: [{ id: string, order_position: number }] }
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.plans || !Array.isArray(body.plans) || body.plans.length === 0) {
      return jsonError("plans array is required and must not be empty", 400);
    }

    for (const item of body.plans) {
      if (!item.id || item.order_position === undefined) {
        return jsonError(
          "Each plan must have an id and order_position",
          400,
        );
      }
    }

    // Look up org for the first plan and verify membership
    const lookup = await getOrgSlugForPlan(body.plans[0].id);
    if (!lookup) return jsonError("Plan not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "editor");

    // Verify all plans belong to the same org
    if (body.plans.length > 1) {
      const planIds = body.plans.map((p: { id: string }) => p.id);
      const rows = await db
        .select({ orgId: plans.organizationId })
        .from(plans)
        .where(inArray(plans.id, planIds));
      const orgIds = new Set(rows.map((r) => r.orgId));
      if (orgIds.size > 1) {
        return jsonError("All plans must belong to the same organization", 403);
      }
    }

    // Update each plan's order_position
    const updates = body.plans.map(
      (item: { id: string; order_position: number }) =>
        db
          .update(plans)
          .set({ orderPosition: item.order_position })
          .where(eq(plans.id, item.id)),
    );

    await Promise.all(updates);

    return jsonOk({ updated: body.plans.length });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
