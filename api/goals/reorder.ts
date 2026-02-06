import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { goals } from "../lib/schema/index";
import { requireAuth } from "../lib/middleware/auth";
import { jsonOk, jsonError } from "../lib/response";

export const config = { runtime: "edge" };

// ---------------------------------------------------------------------------
// PUT /api/goals/reorder — Reorder goals by updating order_position
// ---------------------------------------------------------------------------

export async function PUT(req: Request) {
  try {
    await requireAuth(req);

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
