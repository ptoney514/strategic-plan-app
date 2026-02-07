import { eq, inArray } from "drizzle-orm";
import { db } from "../lib/db";
import { metrics, goals, plans } from "../lib/schema/index";
import { requireOrgMember } from "../lib/middleware/auth";
import { getOrgSlugForMetric } from "../lib/helpers/org-lookup";
import { jsonOk, jsonError } from "../lib/response";

/**
 * PUT /api/metrics/reorder - Reorder metrics
 * Requires auth + org membership (editor role minimum)
 *
 * Body: { metrics: [{ id, order_position }] }
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.metrics) || body.metrics.length === 0) {
      return jsonError("metrics array is required and must not be empty", 400);
    }

    // Validate each entry has id and order_position
    for (const item of body.metrics) {
      if (!item.id || item.order_position === undefined) {
        return jsonError(
          "Each metric must have id and order_position",
          400,
        );
      }
    }

    // Verify org membership using the first metric in the list
    const lookup = await getOrgSlugForMetric(body.metrics[0].id);
    if (!lookup) return jsonError("Metric not found", 404);

    await requireOrgMember(req, lookup.orgSlug, "editor");

    // Verify all metrics belong to the same org
    if (body.metrics.length > 1) {
      const metricIds = body.metrics.map((m: { id: string }) => m.id);
      const metricRows = await db
        .select({ goalId: metrics.goalId })
        .from(metrics)
        .where(inArray(metrics.id, metricIds));
      const uniqueGoalIds = [...new Set(metricRows.map((r) => r.goalId))];

      const goalRows = await db
        .select({ planId: goals.planId })
        .from(goals)
        .where(inArray(goals.id, uniqueGoalIds));
      const uniquePlanIds = [...new Set(goalRows.map((r) => r.planId))];

      const planRows = await db
        .select({ orgId: plans.organizationId })
        .from(plans)
        .where(inArray(plans.id, uniquePlanIds));
      const uniqueOrgIds = new Set(planRows.map((r) => r.orgId));

      if (uniqueOrgIds.size > 1) {
        return jsonError("All metrics must belong to the same organization", 403);
      }
    }

    // Update each metric's orderPosition
    const updates = await Promise.all(
      body.metrics.map(
        (item: { id: string; order_position: number }) =>
          db
            .update(metrics)
            .set({ orderPosition: item.order_position })
            .where(eq(metrics.id, item.id))
            .returning({ id: metrics.id, orderPosition: metrics.orderPosition }),
      ),
    );

    return jsonOk({
      updated: updates.flat().map((u) => ({
        id: u.id,
        order_position: u.orderPosition,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonError(
      error instanceof Error ? error.message : "Internal server error",
      500,
    );
  }
}
