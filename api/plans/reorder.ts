import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { plans } from "../lib/schema/index";
import { requireAuth } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

/**
 * PUT /api/plans/reorder - Reorder plans by updating order_position
 * Body: { plans: [{ id: string, order_position: number }] }
 */
export async function PUT(req: Request) {
  try {
    await requireAuth(req);

    const body = await req.json();

    if (!body.plans || !Array.isArray(body.plans)) {
      return jsonError("plans array is required", 400);
    }

    for (const item of body.plans) {
      if (!item.id || item.order_position === undefined) {
        return jsonError(
          "Each plan must have an id and order_position",
          400,
        );
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
