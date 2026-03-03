import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { widgets } from "../../lib/schema/index.js";
import { requireOrgMember } from "../../lib/middleware/auth.js";
import { jsonOk, jsonError } from "../../lib/response.js";

/**
 * PUT /api/v2/widgets/reorder
 * Reorder widgets by updating their positions.
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const orgSlug = body.orgSlug;
    const widgetList = body.widgets;

    if (!orgSlug) {
      return jsonError("orgSlug is required", 400);
    }

    if (!Array.isArray(widgetList) || widgetList.length === 0) {
      return jsonError("widgets array is required", 400);
    }

    await requireOrgMember(req, orgSlug, "editor");

    await Promise.all(
      widgetList.map((w: { id: string; position: number }) =>
        db
          .update(widgets)
          .set({ position: w.position })
          .where(eq(widgets.id, w.id)),
      ),
    );

    return jsonOk({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[widgets reorder] Error:", error);
    return jsonError("Internal server error", 500);
  }
}
