import { inArray, and, eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets } from "../../lib/schema/index.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/**
 * GET /api/v2/widgets/by-goals?ids=id1,id2,id3
 * Batch fetch active widgets for multiple goals. No auth required (public endpoint).
 * Avoids N+1 queries on drill-down pages.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");

    if (!idsParam) {
      return jsonError("ids parameter is required", 400);
    }

    const goalIds = idsParam.split(",").filter(Boolean);

    if (goalIds.length === 0) {
      return jsonOk([]);
    }

    if (goalIds.length > 100) {
      return jsonError("Maximum 100 goal IDs allowed", 400);
    }

    const rows = await db
      .select()
      .from(widgets)
      .where(
        and(
          inArray(widgets.goalId, goalIds),
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
    console.error("[widgets by-goals GET] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
