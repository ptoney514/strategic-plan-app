import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets } from "../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/**
 * GET /api/v2/widgets/by-goal?goalId=xxx
 * List active widgets for a specific goal. No auth required (public endpoint).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const goalId = url.searchParams.get("goalId");

    if (!goalId) {
      return jsonError("goalId is required", 400);
    }

    const rows = await db
      .select()
      .from(widgets)
      .where(
        and(
          eq(widgets.goalId, goalId),
          eq(widgets.isActive, true),
        ),
      )
      .orderBy(widgets.position);

    const mapped = rows.map((w) => ({
      id: w.id,
      organizationId: w.organizationId,
      planId: w.planId,
      goalId: w.goalId,
      type: w.type,
      title: w.title,
      subtitle: w.subtitle,
      config: w.config,
      position: w.position,
      isActive: w.isActive,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    return jsonOk(mapped);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widgets by-goal GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
