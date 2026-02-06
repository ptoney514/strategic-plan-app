import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import {
  metrics,
  goals,
  plans,
  organizations,
} from "../lib/schema/index";
import { requireAuth, requireOrgMember } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/** Look up metric -> goal -> plan -> organization slug */
async function getOrgSlugForMetric(metricId: string) {
  const [row] = await db
    .select({
      metricId: metrics.id,
      orgSlug: organizations.slug,
    })
    .from(metrics)
    .innerJoin(goals, eq(metrics.goalId, goals.id))
    .innerJoin(plans, eq(goals.planId, plans.id))
    .innerJoin(organizations, eq(plans.organizationId, organizations.id))
    .where(eq(metrics.id, metricId))
    .limit(1);

  return row ?? null;
}

/**
 * PUT /api/metrics/reorder - Reorder metrics
 * Requires auth + org membership (editor role minimum)
 *
 * Body: { metrics: [{ id, order_position }] }
 */
export async function PUT(req: Request) {
  try {
    await requireAuth(req);

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
